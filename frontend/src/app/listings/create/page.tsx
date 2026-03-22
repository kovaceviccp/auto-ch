"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { SWISS_CANTONS, CAR_MAKES } from "@/types";
import Link from "next/link";
import {
  Upload, X, ChevronRight, ChevronLeft, Car, Wrench,
  MapPin, DollarSign, FileText, Image as ImageIcon, Check,
  AlertCircle, Loader2
} from "lucide-react";

// Equipment options grouped by category
const EQUIPMENT_GROUPS = [
  {
    label: "Sicherheit",
    key: "safety",
    items: [
      { key: "abs", label: "ABS" },
      { key: "esp", label: "ESP" },
      { key: "airbag_front", label: "Frontairbags" },
      { key: "airbag_side", label: "Seitenairbags" },
      { key: "parking_sensors_rear", label: "Einparkhilfe hinten" },
      { key: "parking_sensors_front", label: "Einparkhilfe vorne" },
      { key: "reversing_camera", label: "Rückfahrkamera" },
      { key: "lane_assist", label: "Spurhalteassistent" },
      { key: "blind_spot", label: "Totwinkelassistent" },
      { key: "adaptive_cruise", label: "Adaptiver Tempomat" },
    ],
  },
  {
    label: "Komfort",
    key: "comfort",
    items: [
      { key: "climate_control", label: "Klimaanlage / Klima" },
      { key: "seat_heating", label: "Sitzheizung" },
      { key: "steering_heating", label: "Lenkradheizung" },
      { key: "electric_seats", label: "Elektrische Sitze" },
      { key: "electric_windows", label: "Elektrische Fensterheber" },
      { key: "electric_mirrors", label: "Elektrische Spiegel" },
      { key: "keyless_entry", label: "Keyless Entry" },
      { key: "start_stop", label: "Start-Stopp-Automatik" },
      { key: "tow_bar", label: "Anhängerkupplung (AHK)" },
      { key: "roof_rack", label: "Dachreling" },
    ],
  },
  {
    label: "Infotainment",
    key: "infotainment",
    items: [
      { key: "navigation", label: "Navigationssystem" },
      { key: "bluetooth", label: "Bluetooth" },
      { key: "apple_carplay", label: "Apple CarPlay" },
      { key: "android_auto", label: "Android Auto" },
      { key: "dab_radio", label: "DAB+ Radio" },
      { key: "usb", label: "USB-Anschlüsse" },
      { key: "wireless_charging", label: "Induktionsladen" },
      { key: "head_up_display", label: "Head-Up-Display" },
    ],
  },
  {
    label: "Exterieur",
    key: "exterior",
    items: [
      { key: "panorama_roof", label: "Panoramadach" },
      { key: "sunroof", label: "Schiebedach" },
      { key: "alloy_wheels", label: "Alufelgen" },
      { key: "led_lights", label: "LED-Scheinwerfer" },
      { key: "xenon_lights", label: "Xenon-Scheinwerfer" },
      { key: "tinted_windows", label: "Getönte Scheiben" },
      { key: "sport_package", label: "Sportpaket" },
    ],
  },
];

const STEPS = [
  { id: 1, label: "Fahrzeug", icon: Car },
  { id: 2, label: "Details", icon: Wrench },
  { id: 3, label: "Ausstattung", icon: Check },
  { id: 4, label: "Preis & Ort", icon: MapPin },
  { id: 5, label: "Fotos", icon: ImageIcon },
  { id: 6, label: "Beschreibung", icon: FileText },
];

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";
const selectCls = inputCls;

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    vehicle_type: "car",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    condition: "used",
    body_type: "",
    // Step 2
    mileage_km: "",
    fuel_type: "",
    transmission: "",
    engine_cc: "",
    power_kw: "",
    doors: "",
    seats: "",
    color: "",
    color_type: "",
    owners: "",
    mfk_month: "",
    mfk_year: "",
    warranty: "",
    service_history: "",
    // Step 3: equipment
    equipment: {} as Record<string, boolean>,
    // Step 4
    price_chf: "",
    price_negotiable: false,
    leasing_available: false,
    warranty_included: false,
    canton: "",
    city: "",
    // Step 6
    title: "",
    description: "",
  });

  const set = (k: string, v: string | boolean | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleEquip = (key: string) =>
    setForm((f) => ({
      ...f,
      equipment: { ...f.equipment, [key]: !f.equipment[key] },
    }));

  // Auto-generate title when make/model/year change
  const getAutoTitle = () => {
    const parts = [form.make, form.model, form.year].filter(Boolean);
    return parts.join(" ");
  };

  // Image handling
  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...valid].slice(0, 20));
    setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 20));
  }, []);

  const removeImage = (idx: number) => {
    setImageFiles((p) => p.filter((_, i) => i !== idx));
    setImagePreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // Validate current step before advancing
  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.make) return "Bitte wählen Sie eine Marke";
      if (!form.model) return "Bitte geben Sie ein Modell ein";
    }
    if (step === 4) {
      if (!form.price_chf) return "Bitte geben Sie einen Preis ein";
      if (!form.canton) return "Bitte wählen Sie einen Kanton";
    }
    if (step === 6) {
      if (!form.title) return "Bitte geben Sie einen Inserat-Titel ein";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    if (!user) { router.push("/auth/login"); return; }
    setIsLoading(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        title: form.title || getAutoTitle(),
        description: form.description || null,
        vehicle_type: form.vehicle_type,
        condition: form.condition,
        make: form.make,
        model: form.model,
        year: Number(form.year),
        price_chf: Number(form.price_chf),
        price_negotiable: form.price_negotiable,
        leasing_available: form.leasing_available,
        canton: form.canton,
        city: form.city || null,
        features: {
          ...form.equipment,
          body_type: form.body_type || null,
          color_type: form.color_type || null,
          owners: form.owners ? Number(form.owners) : null,
          mfk: form.mfk_year ? `${form.mfk_month}/${form.mfk_year}` : null,
          warranty: form.warranty || null,
          service_history: form.service_history || null,
          warranty_included: form.warranty_included,
        },
      };
      if (form.mileage_km) payload.mileage_km = Number(form.mileage_km);
      if (form.fuel_type) payload.fuel_type = form.fuel_type;
      if (form.transmission) payload.transmission = form.transmission;
      if (form.engine_cc) payload.engine_cc = Number(form.engine_cc);
      if (form.power_kw) payload.power_kw = Number(form.power_kw);
      if (form.doors) payload.doors = Number(form.doors);
      if (form.seats) payload.seats = Number(form.seats);
      if (form.color) payload.color = form.color;

      const { data } = await api.post("/listings", payload);
      const listingId = data.id;

      // Upload images if any
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("files", f));
        await api.post(`/listings/${listingId}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      router.push(`/listings/${listingId}`);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError.response?.data?.detail || "Fehler beim Erstellen des Inserats");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Anmeldung erforderlich</h1>
        <p className="text-gray-500 mb-6">Um ein Inserat aufzugeben, müssen Sie angemeldet sein.</p>
        <Link href="/auth/login" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors">
          Jetzt anmelden
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inserat aufgeben</h1>
        <p className="text-gray-400 text-sm mt-1">Kostenlos und in wenigen Minuten</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => step > s.id && setStep(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step === s.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : step > s.id
                  ? "bg-primary-100 text-primary-700 cursor-pointer hover:bg-primary-200"
                  : "bg-gray-100 text-gray-400 cursor-default"
              }`}
            >
              {step > s.id ? (
                <Check className="w-3 h-3" />
              ) : (
                <s.icon className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.id}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-0.5 flex-shrink-0 ${step > s.id ? "bg-primary-300" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* STEP 1: Fahrzeug */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-lg">Fahrzeuginformationen</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fahrzeugtyp *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "car", l: "Personenwagen" },
                { v: "van", l: "Lieferwagen" },
                { v: "truck", l: "Lastwagen" },
                { v: "bus", l: "Bus" },
                { v: "trailer", l: "Anhänger" },
                { v: "agricultural", l: "Landwirtschaft" },
              ].map((t) => (
                <button
                  key={t.v}
                  type="button"
                  onClick={() => set("vehicle_type", t.v)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border-2 transition-all ${
                    form.vehicle_type === t.v
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Marke *</label>
              <select value={form.make} onChange={(e) => set("make", e.target.value)} className={selectCls} required>
                <option value="">Marke wählen</option>
                {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                <option value="Andere">Andere</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Modell *</label>
              <input type="text" value={form.model} onChange={(e) => set("model", e.target.value)} className={inputCls} placeholder="z.B. 320d Touring" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jahrgang *</label>
              <select value={form.year} onChange={(e) => set("year", Number(e.target.value))} className={selectCls}>
                {Array.from({ length: 40 }, (_, i) => 2025 - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Zustand</label>
              <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className={selectCls}>
                <option value="used">Gebraucht</option>
                <option value="new">Neu</option>
                <option value="damaged">Beschädigt / Unfall</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Karosserie</label>
            <select value={form.body_type} onChange={(e) => set("body_type", e.target.value)} className={selectCls}>
              <option value="">— wählen</option>
              <option value="limousine">Limousine</option>
              <option value="kombi">Kombi</option>
              <option value="suv">SUV / Geländewagen</option>
              <option value="hatchback">Schrägheck</option>
              <option value="coupe">Coupé</option>
              <option value="cabrio">Cabriolet</option>
              <option value="van">Van / Minivan</option>
              <option value="pickup">Pick-up</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 2: Details */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-lg">Technische Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kilometerstand</label>
              <div className="relative">
                <input type="number" value={form.mileage_km} onChange={(e) => set("mileage_km", e.target.value)} className={inputCls + " pr-12"} placeholder="z.B. 85000" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">km</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Treibstoff</label>
              <select value={form.fuel_type} onChange={(e) => set("fuel_type", e.target.value)} className={selectCls}>
                <option value="">— wählen</option>
                <option value="petrol">Benzin</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Elektro</option>
                <option value="hybrid">Hybrid (Vollhybrid)</option>
                <option value="plugin_hybrid">Plug-in Hybrid</option>
                <option value="lpg">Autogas (LPG)</option>
                <option value="cng">Erdgas (CNG)</option>
                <option value="hydrogen">Wasserstoff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Getriebe</label>
              <select value={form.transmission} onChange={(e) => set("transmission", e.target.value)} className={selectCls}>
                <option value="">— wählen</option>
                <option value="manual">Schaltgetriebe</option>
                <option value="automatic">Automatik</option>
                <option value="semi_automatic">Halbautomatik / DSG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hubraum</label>
              <div className="relative">
                <input type="number" value={form.engine_cc} onChange={(e) => set("engine_cc", e.target.value)} className={inputCls + " pr-12"} placeholder="z.B. 1995" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm³</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Leistung</label>
              <div className="relative">
                <input type="number" value={form.power_kw} onChange={(e) => set("power_kw", e.target.value)} className={inputCls + " pr-8"} placeholder="140" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">kW</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Türen</label>
              <select value={form.doors} onChange={(e) => set("doors", e.target.value)} className={selectCls}>
                <option value="">—</option>
                {[2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sitzplätze</label>
              <select value={form.seats} onChange={(e) => set("seats", e.target.value)} className={selectCls}>
                <option value="">—</option>
                {[2, 3, 4, 5, 6, 7, 8, 9].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Farbe</label>
              <input type="text" value={form.color} onChange={(e) => set("color", e.target.value)} className={inputCls} placeholder="z.B. Schwarz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lackierung</label>
              <select value={form.color_type} onChange={(e) => set("color_type", e.target.value)} className={selectCls}>
                <option value="">—</option>
                <option value="uni">Unilack</option>
                <option value="metallic">Metallic</option>
                <option value="pearl">Perleffekt</option>
                <option value="matte">Matt</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Fahrzeuggeschichte</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vorbesitzer</label>
                <select value={form.owners} onChange={(e) => set("owners", e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">MFK (nächste HU)</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.mfk_month} onChange={(e) => set("mfk_month", e.target.value)} className={selectCls}>
                    <option value="">Monat</option>
                    {["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"].map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select value={form.mfk_year} onChange={(e) => set("mfk_year", e.target.value)} className={selectCls}>
                    <option value="">Jahr</option>
                    {Array.from({ length: 8 }, (_, i) => 2025 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Servicehistorie</label>
                <select value={form.service_history} onChange={(e) => set("service_history", e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  <option value="full">Lückenlos (Markenwerkstatt)</option>
                  <option value="partial">Teilweise vorhanden</option>
                  <option value="none">Nicht vorhanden</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Garantie</label>
                <select value={form.warranty} onChange={(e) => set("warranty", e.target.value)} className={selectCls}>
                  <option value="">Keine</option>
                  <option value="3m">3 Monate</option>
                  <option value="6m">6 Monate</option>
                  <option value="12m">12 Monate</option>
                  <option value="24m">24 Monate</option>
                  <option value="factory">Werksgarantie</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Ausstattung */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Ausstattung & Extras</h2>
            <p className="text-gray-400 text-sm mt-0.5">Wählen Sie alle zutreffenden Optionen</p>
          </div>

          {EQUIPMENT_GROUPS.map((group) => (
            <div key={group.key}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-primary-500 rounded-full inline-block" />
                {group.label}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleEquip(item.key)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                      form.equipment[item.key]
                        ? "border-primary-400 bg-primary-50 text-primary-800 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                      form.equipment[item.key] ? "bg-primary-600 border-primary-600" : "border-gray-300"
                    }`}>
                      {form.equipment[item.key] && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {Object.values(form.equipment).filter(Boolean).length > 0 && (
            <div className="bg-primary-50 rounded-xl px-4 py-2.5 text-sm text-primary-700 font-medium">
              {Object.values(form.equipment).filter(Boolean).length} Ausstattungsmerkmale ausgewählt
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Preis & Ort */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-lg">Preis & Standort</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Preis (CHF) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">CHF</span>
              <input
                type="number"
                value={form.price_chf}
                onChange={(e) => set("price_chf", e.target.value)}
                className={inputCls + " pl-14"}
                placeholder="25'000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { key: "price_negotiable", label: "Preis verhandelbar", desc: "Käufer können ein Gebot machen" },
              { key: "leasing_available", label: "Leasing möglich", desc: "Finanzierung über Leasing" },
              { key: "warranty_included", label: "Garantie inbegriffen", desc: "Garantie im Preis enthalten" },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    form[opt.key as keyof typeof form]
                      ? "bg-primary-600 border-primary-600"
                      : "border-gray-300"
                  }`}
                  onClick={() => set(opt.key, !form[opt.key as keyof typeof form])}
                >
                  {form[opt.key as keyof typeof form] && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                  <div className="text-xs text-gray-400">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kanton *</label>
              <select value={form.canton} onChange={(e) => set("canton", e.target.value)} className={selectCls} required>
                <option value="">Kanton wählen</option>
                {SWISS_CANTONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stadt / Ort</label>
              <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} placeholder="z.B. Zürich" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Fotos */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Fotos hochladen</h2>
            <p className="text-gray-400 text-sm mt-0.5">Bis zu 20 Fotos. Erste Foto wird als Titelbild verwendet.</p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary-400 bg-primary-50"
                : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
            }`}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">Fotos hierher ziehen</p>
            <p className="text-xs text-gray-400 mt-1">oder klicken zum Auswählen · JPG, PNG, WebP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {/* Preview grid */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[10px] text-center py-0.5 font-medium">
                      Titelbild
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 20 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-300 flex items-center justify-center text-gray-300 hover:text-primary-400 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {imagePreviews.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-2">
              Sie können Fotos auch später hinzufügen.
            </p>
          )}
        </div>
      )}

      {/* STEP 6: Beschreibung & Titel */}
      {step === 6 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-lg">Inserat-Text</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Inserat-Titel *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder={getAutoTitle() || "z.B. BMW 320d xDrive Touring, AHK, Panorama"}
            />
            {!form.title && getAutoTitle() && (
              <button
                type="button"
                onClick={() => set("title", getAutoTitle())}
                className="mt-1.5 text-xs text-primary-600 hover:text-primary-700"
              >
                Vorschlag übernehmen: „{getAutoTitle()}"
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Beschreibung</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={8}
              className={inputCls + " resize-none leading-relaxed"}
              placeholder={`Beschreiben Sie Ihr Fahrzeug ausführlich:
• Grund des Verkaufs
• Besonderheiten & Extras
• Bekannte Mängel
• Wartungshistorie
• Besichtigungsmöglichkeiten`}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">Je mehr Details, desto schneller der Verkauf</span>
              <span className="text-xs text-gray-400">{form.description.length} Zeichen</span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-medium text-gray-700 mb-2">Zusammenfassung</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-gray-400">Fahrzeug:</span>
              <span className="text-gray-800 font-medium">{form.make} {form.model} {form.year}</span>
              <span className="text-gray-400">Preis:</span>
              <span className="text-gray-800 font-medium">CHF {Number(form.price_chf).toLocaleString("de-CH")}</span>
              <span className="text-gray-400">Standort:</span>
              <span className="text-gray-800 font-medium">{form.canton}{form.city ? ` / ${form.city}` : ""}</span>
              <span className="text-gray-400">Fotos:</span>
              <span className="text-gray-800 font-medium">{imageFiles.length} Foto{imageFiles.length !== 1 ? "s" : ""}</span>
              <span className="text-gray-400">Ausstattung:</span>
              <span className="text-gray-800 font-medium">{Object.values(form.equipment).filter(Boolean).length} Merkmale</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Zurück
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
            Abbrechen
          </Link>
        )}

        {step < STEPS.length ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Weiter <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Wird veröffentlicht...</>
            ) : (
              <><Check className="w-4 h-4" /> Inserat veröffentlichen</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
