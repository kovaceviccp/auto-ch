"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Car,
  Calendar,
  Gauge,
  Fuel,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { CAR_MAKES, CAR_MODELS } from "@/types";
// useT imported per spec; translations are inline German/English strings for this page
import { useT } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  make: string;
  model: string;
  year: number;
  condition: string;
  mileage: number;
  fuel: string;
  transmission: string;
  power: number;
};

// ─── Valuation algorithm ──────────────────────────────────────────────────────

const BASE_PRICES: Record<string, number> = {
  Porsche: 85000,
  BMW: 42000,
  "Mercedes-Benz": 45000,
  Audi: 38000,
  Volkswagen: 28000,
  Volvo: 35000,
  Tesla: 55000,
  "Land Rover": 55000,
  Jaguar: 48000,
  Toyota: 28000,
  Honda: 24000,
  Ford: 22000,
  Renault: 19000,
  Peugeot: 18000,
  Hyundai: 21000,
  Kia: 20000,
  Skoda: 23000,
  Seat: 21000,
  Opel: 18000,
  Fiat: 16000,
  "Citroën": 17000,
  Mazda: 25000,
  Nissan: 21000,
  Suzuki: 17000,
  Subaru: 28000,
  Mitsubishi: 22000,
  Dacia: 14000,
  "Alfa Romeo": 32000,
};
const DEFAULT_BASE = 25000;

function calculateValue(form: FormState): {
  low: number;
  mid: number;
  high: number;
} {
  const base = BASE_PRICES[form.make] ?? DEFAULT_BASE;
  const age = new Date().getFullYear() - form.year;
  const depreciationRate = form.fuel === "electric" ? 0.1 : 0.12;
  const ageMultiplier = Math.max(0.15, 1 - age * depreciationRate);

  const mileageDeduction =
    Math.max(0, (form.mileage - 15000 * Math.max(1, age)) / 1000) * 150;

  const fuelBonus: Record<string, number> = {
    electric: 8000,
    plugin_hybrid: 4000,
    hybrid: 2000,
    diesel: 500,
    petrol: 0,
    lpg: -1000,
  };
  const conditionMultiplier: Record<string, number> = {
    new: 1.0,
    used: 0.85,
    damaged: 0.45,
  };
  const powerBonus = Math.max(0, (form.power - 100) * 30);

  const mid = Math.max(
    500,
    Math.round(
      base * ageMultiplier * (conditionMultiplier[form.condition] ?? 0.85) -
        mileageDeduction +
        (fuelBonus[form.fuel] ?? 0) +
        powerBonus
    )
  );

  return { low: Math.round(mid * 0.88), mid, high: Math.round(mid * 1.12) };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Swiss number format: 24500 → "24'500" */
function chf(n: number): string {
  return n.toLocaleString("de-CH").replace(/,/g, "'");
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

const FUEL_OPTIONS = [
  { value: "petrol", label: "Benzin / Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Elektro / Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "plugin_hybrid", label: "Plug-in Hybrid" },
  { value: "lpg", label: "LPG / Autogas" },
];

const CONDITION_OPTIONS = [
  { value: "new", label: "Neu / New" },
  { value: "used", label: "Occasion / Used" },
  { value: "damaged", label: "Unfall / Damaged" },
];

const TRANSMISSION_OPTIONS = [
  { value: "manual", label: "Schaltgetriebe / Manual" },
  { value: "automatic", label: "Automat / Automatic" },
  { value: "semi_automatic", label: "Halbautomatik / Semi-auto" },
];

const STEP_LABELS = [
  "Marke & Modell",
  "Jahrgang & Zustand",
  "Kilometerstand",
  "Antrieb",
  "Leistung",
  "Bewertung",
];

const STEP_ICONS = [Car, Calendar, Gauge, Fuel, Zap, TrendingUp];

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {Array.from({ length: total }).map((_, i) => {
          const Icon = STEP_ICONS[i];
          const completed = i < step;
          const current = i === step;
          return (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  completed
                    ? "bg-blue-600 text-white"
                    : current
                    ? "bg-white border-2 border-blue-600 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              {i < total - 1 && (
                <div
                  className={`h-0.5 w-6 sm:w-10 transition-all duration-500 ${
                    i < step ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Bar */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">
        Schritt {step + 1} von {total} — {STEP_LABELS[step]}
      </p>
    </div>
  );
}

function StepCard({
  children,
  animKey,
}: {
  children: React.ReactNode;
  animKey: number;
}) {
  return (
    <div
      key={animKey}
      className="animate-fade-in-up bg-white rounded-2xl shadow-lg shadow-gray-200/80 border border-gray-100 p-6 sm:p-8"
    >
      {children}
    </div>
  );
}

function StepTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-500 ml-13 pl-0.5 mt-1">{subtitle}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function OptionGrid({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 text-left ${
              value === o.value
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function NavButtons({
  step,
  totalSteps,
  onBack,
  onNext,
  canProceed,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}) {
  const isLast = step === totalSteps - 2; // last input step before result
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
      {step > 0 ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Zurück
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
          canProceed
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isLast ? "Bewertung anzeigen" : "Weiter"}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

export default function ValuationPage() {
  // useT hook — available if needed for future i18n expansion
  const t = useT();

  // Suppress unused variable warning; translations are inline for this page
  void t;

  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const [form, setForm] = useState<FormState>({
    make: "",
    model: "",
    year: CURRENT_YEAR - 5,
    condition: "used",
    mileage: 75000,
    fuel: "petrol",
    transmission: "manual",
    power: 120,
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const goNext = () => {
    setAnimKey((k) => k + 1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const goBack = () => {
    setAnimKey((k) => k + 1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const availableModels = form.make ? (CAR_MODELS[form.make] ?? []) : [];

  const canProceedPerStep: boolean[] = [
    !!form.make && !!form.model,           // step 0
    !!form.year && !!form.condition,        // step 1
    form.mileage >= 0,                     // step 2
    !!form.fuel && !!form.transmission,    // step 3
    form.power > 0,                        // step 4
    true,                                  // step 5 (result)
  ];

  const result = calculateValue(form);
  const confidence = Math.min(
    98,
    Math.round(
      60 +
        (form.make ? 6 : 0) +
        (form.model ? 6 : 0) +
        (form.year ? 6 : 0) +
        (form.condition ? 6 : 0) +
        (form.mileage >= 0 ? 6 : 0) +
        (form.fuel ? 6 : 0) +
        (form.transmission ? 6 : 0) +
        (form.power ? 6 : 0)
    )
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            Gratis Fahrzeugbewertung
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Was ist Ihr Auto wert?
          </h1>
          <p className="text-gray-500 text-sm">
            Erhalten Sie in 2 Minuten eine kostenlose Preisschätzung für Ihr
            Fahrzeug auf dem Schweizer Markt.
          </p>
        </div>

        {/* Progress */}
        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* Step 0: Brand + Model */}
        {step === 0 && (
          <StepCard animKey={animKey}>
            <StepTitle
              icon={Car}
              title="Marke & Modell"
              subtitle="Wählen Sie die Marke und das Modell Ihres Fahrzeugs."
            />
            <div className="flex flex-col gap-4">
              <SelectField
                label="Marke / Make"
                value={form.make}
                onChange={(v) => {
                  set("make", v);
                  set("model", "");
                }}
                options={CAR_MAKES.map((m) => ({ value: m, label: m }))}
                placeholder="Marke wählen..."
              />
              <SelectField
                label="Modell / Model"
                value={form.model}
                onChange={(v) => set("model", v)}
                options={availableModels.map((m) => ({ value: m, label: m }))}
                placeholder={
                  form.make ? "Modell wählen..." : "Zuerst Marke wählen"
                }
              />
            </div>
            <NavButtons
              step={step}
              totalSteps={TOTAL_STEPS}
              onBack={goBack}
              onNext={goNext}
              canProceed={canProceedPerStep[0]}
            />
          </StepCard>
        )}

        {/* Step 1: Year + Condition */}
        {step === 1 && (
          <StepCard animKey={animKey}>
            <StepTitle
              icon={Calendar}
              title="Jahrgang & Zustand"
              subtitle="Wann wurde das Fahrzeug erstmals zugelassen und in welchem Zustand ist es?"
            />
            <div className="flex flex-col gap-5">
              <SelectField
                label="Erstzulassung / Year"
                value={form.year}
                onChange={(v) => set("year", Number(v))}
                options={YEARS.map((y) => ({ value: y, label: String(y) }))}
              />
              <OptionGrid
                label="Zustand / Condition"
                options={CONDITION_OPTIONS}
                value={form.condition}
                onChange={(v) => set("condition", v)}
              />
            </div>
            <NavButtons
              step={step}
              totalSteps={TOTAL_STEPS}
              onBack={goBack}
              onNext={goNext}
              canProceed={canProceedPerStep[1]}
            />
          </StepCard>
        )}

        {/* Step 2: Mileage */}
        {step === 2 && (
          <StepCard animKey={animKey}>
            <StepTitle
              icon={Gauge}
              title="Kilometerstand"
              subtitle="Wie viele Kilometer hat Ihr Fahrzeug zurückgelegt?"
            />
            <div className="mt-2">
              <SliderField
                label="Kilometerstand / Mileage"
                value={form.mileage}
                onChange={(v) => set("mileage", v)}
                min={0}
                max={300000}
                step={5000}
                format={(v) => `${v.toLocaleString("de-CH")} km`}
              />
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <strong>Hinweis:</strong> Fahrzeuge mit weniger als{" "}
                {(15000 * Math.max(1, CURRENT_YEAR - form.year)).toLocaleString(
                  "de-CH"
                )}{" "}
                km (Durchschnitt) erzielen tendenziell höhere Preise.
              </div>
            </div>
            <NavButtons
              step={step}
              totalSteps={TOTAL_STEPS}
              onBack={goBack}
              onNext={goNext}
              canProceed={canProceedPerStep[2]}
            />
          </StepCard>
        )}

        {/* Step 3: Fuel + Transmission */}
        {step === 3 && (
          <StepCard animKey={animKey}>
            <StepTitle
              icon={Fuel}
              title="Antrieb & Getriebe"
              subtitle="Welchen Antrieb und welches Getriebe hat Ihr Fahrzeug?"
            />
            <div className="flex flex-col gap-5">
              <OptionGrid
                label="Kraftstoff / Fuel"
                options={FUEL_OPTIONS}
                value={form.fuel}
                onChange={(v) => set("fuel", v)}
              />
              <OptionGrid
                label="Getriebe / Transmission"
                options={TRANSMISSION_OPTIONS}
                value={form.transmission}
                onChange={(v) => set("transmission", v)}
              />
            </div>
            <NavButtons
              step={step}
              totalSteps={TOTAL_STEPS}
              onBack={goBack}
              onNext={goNext}
              canProceed={canProceedPerStep[3]}
            />
          </StepCard>
        )}

        {/* Step 4: Power */}
        {step === 4 && (
          <StepCard animKey={animKey}>
            <StepTitle
              icon={Zap}
              title="Motorleistung"
              subtitle="Wie viel PS hat Ihr Fahrzeug?"
            />
            <div className="mt-2">
              <SliderField
                label="Leistung / Power"
                value={form.power}
                onChange={(v) => set("power", v)}
                min={30}
                max={600}
                step={10}
                format={(v) => `${v} PS`}
              />
              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
                {[
                  { range: "30–100 PS", label: "Kleinwagen" },
                  { range: "100–200 PS", label: "Mittelklasse" },
                  { range: "200+ PS", label: "Sportlich" },
                ].map((item) => (
                  <div
                    key={item.range}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="font-semibold text-gray-700 mb-0.5">
                      {item.range}
                    </div>
                    <div>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <NavButtons
              step={step}
              totalSteps={TOTAL_STEPS}
              onBack={goBack}
              onNext={goNext}
              canProceed={canProceedPerStep[4]}
            />
          </StepCard>
        )}

        {/* Step 5: Result */}
        {step === 5 && (
          <div className="animate-fade-in-up space-y-4">
            {/* Price card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-300/40 p-7 text-white">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 opacity-80" />
                <span className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                  Geschätzter Marktwert
                </span>
              </div>

              {/* Main estimate */}
              <div className="text-center mb-6">
                <p className="text-sm opacity-75 mb-1">Mittelwert / Mid estimate</p>
                <p className="text-5xl font-extrabold tracking-tight">
                  CHF {chf(result.mid)}
                </p>
              </div>

              {/* Range */}
              <div className="bg-white/15 backdrop-blur rounded-xl px-5 py-4 text-center mb-5">
                <p className="text-xs opacity-75 mb-1 uppercase tracking-wide">
                  Preisband / Price range
                </p>
                <p className="text-xl font-bold">
                  CHF {chf(result.low)}{" "}
                  <span className="opacity-60 mx-1">–</span> CHF {chf(result.high)}
                </p>
              </div>

              {/* Confidence gauge */}
              <div>
                <div className="flex justify-between text-xs opacity-75 mb-1.5">
                  <span>Zuverlässigkeit / Confidence</span>
                  <span className="font-bold">{confidence}%</span>
                </div>
                <div className="h-2 bg-white/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/80 border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Ihre Fahrzeugdaten / Your vehicle details
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ["Marke", form.make || "—"],
                  ["Modell", form.model || "—"],
                  ["Jahrgang", String(form.year)],
                  ["Zustand", CONDITION_OPTIONS.find((o) => o.value === form.condition)?.label ?? form.condition],
                  ["Kilometerstand", `${form.mileage.toLocaleString("de-CH")} km`],
                  ["Kraftstoff", FUEL_OPTIONS.find((o) => o.value === form.fuel)?.label ?? form.fuel],
                  ["Getriebe", TRANSMISSION_OPTIONS.find((o) => o.value === form.transmission)?.label ?? form.transmission],
                  ["Leistung", `${form.power} PS`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-800 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/80 border border-gray-100 p-6 text-center">
              <p className="text-gray-600 text-sm mb-4">
                Bereit, Ihr Fahrzeug zum richtigen Preis zu verkaufen?
              </p>
              <Link
                href="/listings/create"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:shadow-blue-300 w-full justify-center"
              >
                Jetzt inserieren / List your car
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAnimKey((k) => k + 1);
                  setStep(0);
                  setForm({
                    make: "",
                    model: "",
                    year: CURRENT_YEAR - 5,
                    condition: "used",
                    mileage: 75000,
                    fuel: "petrol",
                    transmission: "manual",
                    power: 120,
                  });
                }}
                className="mt-3 text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                Neue Bewertung starten
              </button>
            </div>

            {/* Back */}
            <div className="text-center">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Angaben ändern
              </button>
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Diese Schätzung basiert auf Schweizer Marktdaten und dient nur als
          Orientierung. Tatsächliche Preise können abweichen.
        </p>
      </div>
    </main>
  );
}
