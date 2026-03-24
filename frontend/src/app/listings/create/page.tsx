"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { SWISS_CANTONS, CAR_MAKES, CAR_MODELS, CAR_COLORS } from "@/types";
import { useLanguageStore } from "@/store/language";
import Link from "next/link";
import {
  Upload, X, ChevronRight, ChevronLeft, Car, Wrench,
  MapPin, DollarSign, FileText, Image as ImageIcon, Check,
  AlertCircle, Loader2
} from "lucide-react";
import { useT } from "@/lib/i18n";

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";
const selectCls = inputCls;

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const t = useT();
  const { lang } = useLanguageStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fieldLabels: Record<string, string> = {
    title: t("create_listing_title_label").replace(" *", ""),
    make: t("create_make_label").replace(" *", ""),
    model: t("create_model_label").replace(" *", ""),
    year: t("create_year_label").replace(" *", ""),
    price_chf: t("create_price_label").replace(" *", ""),
    canton: t("create_canton_label").replace(" *", ""),
    vehicle_type: t("create_vehicle_type_label").replace(" *", ""),
    condition: t("create_condition_label"),
    mileage_km: t("create_mileage_label"),
    fuel_type: t("create_fuel_label"),
    transmission: t("create_transmission_label"),
    engine_cc: t("create_engine_label"),
    power_kw: t("create_power_label"),
    doors: t("create_doors_label"),
    seats: t("create_seats_label"),
    color: t("create_color_label"),
    city: t("create_city_label"),
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const EQUIPMENT_GROUPS = [
    {
      label: t("equip_safety"),
      key: "safety",
      items: [
        { key: "abs", label: t("equip_abs") },
        { key: "esp", label: t("equip_esp") },
        { key: "airbag_front", label: t("equip_airbag_front") },
        { key: "airbag_side", label: t("equip_airbag_side") },
        { key: "parking_sensors_rear", label: t("equip_parking_rear") },
        { key: "parking_sensors_front", label: t("equip_parking_front") },
        { key: "reversing_camera", label: t("equip_reversing_camera") },
        { key: "lane_assist", label: t("equip_lane_assist") },
        { key: "blind_spot", label: t("equip_blind_spot") },
        { key: "adaptive_cruise", label: t("equip_adaptive_cruise") },
      ],
    },
    {
      label: t("equip_comfort"),
      key: "comfort",
      items: [
        { key: "climate_control", label: t("equip_climate") },
        { key: "seat_heating", label: t("equip_seat_heating") },
        { key: "steering_heating", label: t("equip_steering_heating") },
        { key: "electric_seats", label: t("equip_electric_seats") },
        { key: "electric_windows", label: t("equip_electric_windows") },
        { key: "electric_mirrors", label: t("equip_electric_mirrors") },
        { key: "keyless_entry", label: t("equip_keyless") },
        { key: "start_stop", label: t("equip_start_stop") },
        { key: "tow_bar", label: t("equip_tow_bar") },
        { key: "roof_rack", label: t("equip_roof_rack") },
      ],
    },
    {
      label: t("equip_infotainment"),
      key: "infotainment",
      items: [
        { key: "navigation", label: t("equip_navigation") },
        { key: "bluetooth", label: t("equip_bluetooth") },
        { key: "apple_carplay", label: t("equip_apple_carplay") },
        { key: "android_auto", label: t("equip_android_auto") },
        { key: "dab_radio", label: t("equip_dab_radio") },
        { key: "usb", label: t("equip_usb") },
        { key: "wireless_charging", label: t("equip_wireless_charging") },
        { key: "head_up_display", label: t("equip_head_up") },
      ],
    },
    {
      label: t("equip_exterior"),
      key: "exterior",
      items: [
        { key: "panorama_roof", label: t("equip_panorama_roof") },
        { key: "sunroof", label: t("equip_sunroof") },
        { key: "alloy_wheels", label: t("equip_alloy_wheels") },
        { key: "led_lights", label: t("equip_led_lights") },
        { key: "xenon_lights", label: t("equip_xenon_lights") },
        { key: "tinted_windows", label: t("equip_tinted_windows") },
        { key: "sport_package", label: t("equip_sport_package") },
      ],
    },
  ];

  const STEPS = [
    { id: 1, label: t("create_step_vehicle"), icon: Car },
    { id: 2, label: t("create_step_details"), icon: Wrench },
    { id: 3, label: t("create_step_equipment"), icon: Check },
    { id: 4, label: t("create_step_price"), icon: MapPin },
    { id: 5, label: t("create_step_photos"), icon: ImageIcon },
    { id: 6, label: t("create_step_description"), icon: FileText },
  ];

  const MONTHS = [
    t("month_jan"), t("month_feb"), t("month_mar"), t("month_apr"),
    t("month_may"), t("month_jun"), t("month_jul"), t("month_aug"),
    t("month_sep"), t("month_oct"), t("month_nov"), t("month_dec"),
  ];

  const [form, setForm] = useState({
    vehicle_type: "car",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    condition: "used",
    body_type: "",
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
    equipment: {} as Record<string, boolean>,
    price_chf: "",
    price_negotiable: false,
    leasing_available: false,
    warranty_included: false,
    canton: "",
    city: "",
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

  const getAutoTitle = () => {
    const parts = [form.make, form.model, form.year].filter(Boolean);
    return parts.join(" ");
  };

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

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.make) return t("create_err_make");
      if (!form.model) return t("create_err_model");
    }
    if (step === 4) {
      if (!form.price_chf) return t("create_err_price");
      if (!form.canton) return t("create_err_canton");
    }
    if (step === 6) {
      if (!form.title) return t("create_err_title");
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

      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("files", f));
        await api.post(`/listings/${listingId}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      router.push(`/listings/${listingId}`);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: unknown } } };
      const detail = axiosError.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map((e: { loc?: unknown[]; msg?: string }) => {
          const field = String(e.loc?.find((x) => x !== "body" && typeof x === "string") ?? "");
          const label = fieldLabels[field] || field;
          return label ? `${label}: ${e.msg}` : (e.msg ?? t("create_error"));
        });
        setError(messages.join("\n"));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(t("create_error"));
      }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("create_login_required")}</h1>
        <p className="text-gray-500 mb-6">{t("create_login_required_sub")}</p>
        <Link href="/auth/login" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors">
          {t("create_login_btn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("create_title")}</h1>
        <p className="text-gray-400 text-sm mt-1">{t("create_subtitle")}</p>
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
        <div className="flex gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {error.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-lg">{t("create_s1_title")}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_vehicle_type_label")}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "car", l: t("cat_car") },
                { v: "van", l: t("cat_van") },
                { v: "truck", l: t("cat_truck") },
                { v: "bus", l: t("cat_bus") },
                { v: "trailer", l: t("cat_trailer") },
                { v: "agricultural", l: t("cat_agri") },
              ].map((vt) => (
                <button
                  key={vt.v}
                  type="button"
                  onClick={() => set("vehicle_type", vt.v)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border-2 transition-all ${
                    form.vehicle_type === vt.v
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {vt.l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_make_label")}</label>
              <select
                value={form.make}
                onChange={(e) => { set("make", e.target.value); set("model", ""); }}
                className={selectCls}
                required
              >
                <option value="">{t("create_make_select")}</option>
                {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                <option value="Andere">{t("create_make_other")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_model_label")}</label>
              {CAR_MODELS[form.make] ? (
                <select value={form.model} onChange={(e) => set("model", e.target.value)} className={selectCls}>
                  <option value="">{t("create_model_placeholder")}</option>
                  {CAR_MODELS[form.make].map((m) => <option key={m} value={m}>{m}</option>)}
                  <option value="Andere">{t("create_make_other")}</option>
                </select>
              ) : (
                <input type="text" value={form.model} onChange={(e) => set("model", e.target.value)} className={inputCls} placeholder={t("create_model_placeholder")} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_year_label")}</label>
              <select value={form.year} onChange={(e) => set("year", Number(e.target.value))} className={selectCls}>
                {Array.from({ length: 40 }, (_, i) => 2025 - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_condition_label")}</label>
              <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className={selectCls}>
                <option value="used">{t("cond_used")}</option>
                <option value="new">{t("cond_new")}</option>
                <option value="damaged">{t("cond_damaged")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_body_label")}</label>
            <select value={form.body_type} onChange={(e) => set("body_type", e.target.value)} className={selectCls}>
              <option value="">{t("create_select")}</option>
              <option value="limousine">{t("body_limousine")}</option>
              <option value="kombi">{t("body_kombi")}</option>
              <option value="suv">{t("body_suv")}</option>
              <option value="hatchback">{t("body_hatchback")}</option>
              <option value="coupe">{t("body_coupe")}</option>
              <option value="cabrio">{t("body_cabrio")}</option>
              <option value="van">{t("body_van_mini")}</option>
              <option value="pickup">{t("body_pickup")}</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-lg">{t("create_s2_title")}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_mileage_label")}</label>
              <div className="relative">
                <input type="number" value={form.mileage_km} onChange={(e) => set("mileage_km", e.target.value)} className={inputCls + " pr-12"} placeholder={t("create_mileage_placeholder")} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">km</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_fuel_label")}</label>
              <select value={form.fuel_type} onChange={(e) => set("fuel_type", e.target.value)} className={selectCls}>
                <option value="">{t("create_select")}</option>
                <option value="petrol">{t("fuel_petrol")}</option>
                <option value="diesel">{t("fuel_diesel")}</option>
                <option value="electric">{t("fuel_electric")}</option>
                <option value="hybrid">{t("fuel_hybrid_full")}</option>
                <option value="plugin_hybrid">{t("fuel_plugin_hybrid")}</option>
                <option value="lpg">{t("fuel_lpg_full")}</option>
                <option value="cng">{t("fuel_cng_full")}</option>
                <option value="hydrogen">{t("fuel_hydrogen")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_transmission_label")}</label>
              <select value={form.transmission} onChange={(e) => set("transmission", e.target.value)} className={selectCls}>
                <option value="">{t("create_select")}</option>
                <option value="manual">{t("trans_manual")}</option>
                <option value="automatic">{t("trans_automatic")}</option>
                <option value="semi_automatic">{t("trans_semi_full")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_engine_label")}</label>
              <div className="relative">
                <input type="number" value={form.engine_cc} onChange={(e) => set("engine_cc", e.target.value)} className={inputCls + " pr-12"} placeholder="1995" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm³</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_power_label")}</label>
              <div className="relative">
                <input type="number" value={form.power_kw} onChange={(e) => set("power_kw", e.target.value)} className={inputCls + " pr-8"} placeholder="140" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">kW</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_doors_label")}</label>
              <select value={form.doors} onChange={(e) => set("doors", e.target.value)} className={selectCls}>
                <option value="">—</option>
                {[2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_seats_label")}</label>
              <select value={form.seats} onChange={(e) => set("seats", e.target.value)} className={selectCls}>
                <option value="">—</option>
                {[2, 3, 4, 5, 6, 7, 8, 9].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("create_color_label")}</label>
            <div className="grid grid-cols-6 gap-2">
              {CAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={lang === "de" ? c.label_de : c.label_en}
                  onClick={() => set("color", lang === "de" ? c.label_de : c.label_en)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    form.color === c.label_de || form.color === c.label_en
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[10px] text-gray-500 leading-tight text-center">
                    {lang === "de" ? c.label_de : c.label_en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_paint_label")}</label>
            <select value={form.color_type} onChange={(e) => set("color_type", e.target.value)} className={selectCls}>
              <option value="">—</option>
              <option value="uni">{t("paint_uni")}</option>
              <option value="metallic">{t("paint_metallic")}</option>
              <option value="pearl">{t("paint_pearl")}</option>
              <option value="matte">{t("paint_matte")}</option>
            </select>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">{t("create_history_title")}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_owners_label")}</label>
                <select value={form.owners} onChange={(e) => set("owners", e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_mfk_label")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.mfk_month} onChange={(e) => set("mfk_month", e.target.value)} className={selectCls}>
                    <option value="">{t("create_month_placeholder")}</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select value={form.mfk_year} onChange={(e) => set("mfk_year", e.target.value)} className={selectCls}>
                    <option value="">{t("create_year_placeholder")}</option>
                    {Array.from({ length: 8 }, (_, i) => 2025 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_service_label")}</label>
                <select value={form.service_history} onChange={(e) => set("service_history", e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  <option value="full">{t("service_full")}</option>
                  <option value="partial">{t("service_partial")}</option>
                  <option value="none">{t("service_none")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_warranty_label")}</label>
                <select value={form.warranty} onChange={(e) => set("warranty", e.target.value)} className={selectCls}>
                  <option value="">{t("warranty_none")}</option>
                  <option value="3m">{t("warranty_3m")}</option>
                  <option value="6m">{t("warranty_6m")}</option>
                  <option value="12m">{t("warranty_12m")}</option>
                  <option value="24m">{t("warranty_24m")}</option>
                  <option value="factory">{t("warranty_factory")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{t("create_s3_title")}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{t("create_s3_sub")}</p>
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
              {Object.values(form.equipment).filter(Boolean).length} {t("create_equip_selected")}
            </div>
          )}
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-lg">{t("create_s4_title")}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_price_label")}</label>
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
              { key: "price_negotiable", label: t("create_negotiable_label"), desc: t("create_negotiable_desc") },
              { key: "leasing_available", label: t("create_leasing_label"), desc: t("create_leasing_desc") },
              { key: "warranty_included", label: t("create_warranty_incl_label"), desc: t("create_warranty_incl_desc") },
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_canton_label")}</label>
              <select value={form.canton} onChange={(e) => set("canton", e.target.value)} className={selectCls} required>
                <option value="">{t("create_select_canton")}</option>
                {SWISS_CANTONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_city_label")}</label>
              <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} placeholder={t("create_city_placeholder")} />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{t("create_s5_title")}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{t("create_s5_sub")}</p>
          </div>

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
            <p className="text-sm font-medium text-gray-700">{t("create_drop_title")}</p>
            <p className="text-xs text-gray-400 mt-1">{t("create_drop_sub")}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[10px] text-center py-0.5 font-medium">
                      {t("create_cover_photo")}
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
              {t("create_photos_later")}
            </p>
          )}
        </div>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-lg">{t("create_s6_title")}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_listing_title_label")}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder={getAutoTitle() || "BMW 320d xDrive Touring"}
            />
            {!form.title && getAutoTitle() && (
              <button
                type="button"
                onClick={() => set("title", getAutoTitle())}
                className="mt-1.5 text-xs text-primary-600 hover:text-primary-700"
              >
                {t("create_suggest_prefix")} „{getAutoTitle()}"
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("create_description_label")}</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={8}
              className={inputCls + " resize-none leading-relaxed"}
              placeholder={t("create_description_placeholder")}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">{t("create_desc_hint")}</span>
              <span className="text-xs text-gray-400">{form.description.length} {t("create_chars")}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-medium text-gray-700 mb-2">{t("create_summary_title")}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-gray-400">{t("create_summary_vehicle")}</span>
              <span className="text-gray-800 font-medium">{form.make} {form.model} {form.year}</span>
              <span className="text-gray-400">{t("create_summary_price")}</span>
              <span className="text-gray-800 font-medium">CHF {Number(form.price_chf).toLocaleString("de-CH")}</span>
              <span className="text-gray-400">{t("create_summary_location")}</span>
              <span className="text-gray-800 font-medium">{form.canton}{form.city ? ` / ${form.city}` : ""}</span>
              <span className="text-gray-400">{t("create_summary_photos")}</span>
              <span className="text-gray-800 font-medium">
                {imageFiles.length} {imageFiles.length !== 1 ? t("create_photo_plural") : t("create_photo_singular")}
              </span>
              <span className="text-gray-400">{t("create_summary_equipment")}</span>
              <span className="text-gray-800 font-medium">{Object.values(form.equipment).filter(Boolean).length} {t("create_features_count")}</span>
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
            <ChevronLeft className="w-4 h-4" /> {t("create_back")}
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
            {t("create_cancel")}
          </Link>
        )}

        {step < STEPS.length ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            {t("create_next")} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t("create_publishing")}</>
            ) : (
              <><Check className="w-4 h-4" /> {t("create_publish")}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
