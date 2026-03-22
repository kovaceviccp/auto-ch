"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SWISS_CANTONS, CAR_MAKES } from "@/types";
import { Search } from "lucide-react";

export function SearchForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    vehicle_type: "",
    make: "",
    canton: "",
    price_to: "",
    year_from: "",
    search: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/listings?${params.toString()}`);
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const selectCls = "bg-white text-gray-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <select
          value={form.vehicle_type}
          onChange={(e) => set("vehicle_type", e.target.value)}
          className={selectCls}
        >
          <option value="">Fahrzeugtyp</option>
          <option value="car">Personenwagen</option>
          <option value="van">Lieferwagen</option>
          <option value="truck">Lastwagen</option>
          <option value="bus">Bus</option>
          <option value="trailer">Anhänger</option>
          <option value="agricultural">Landwirtschaft</option>
        </select>

        <select
          value={form.make}
          onChange={(e) => set("make", e.target.value)}
          className={selectCls}
        >
          <option value="">Marke</option>
          {CAR_MAKES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={form.canton}
          onChange={(e) => set("canton", e.target.value)}
          className={selectCls}
        >
          <option value="">Kanton</option>
          {SWISS_CANTONS.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <select
          value={form.price_to}
          onChange={(e) => set("price_to", e.target.value)}
          className={selectCls}
        >
          <option value="">Max. Preis</option>
          {[
            [5000, "5'000"],
            [10000, "10'000"],
            [20000, "20'000"],
            [30000, "30'000"],
            [50000, "50'000"],
            [75000, "75'000"],
            [100000, "100'000"],
          ].map(([val, label]) => (
            <option key={val} value={val}>bis CHF {label}</option>
          ))}
        </select>

        <select
          value={form.year_from}
          onChange={(e) => set("year_from", e.target.value)}
          className={selectCls}
        >
          <option value="">Jahrgang ab</option>
          {Array.from({ length: 30 }, (_, i) => 2024 - i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Search className="w-4 h-4" />
          Suchen
        </button>
      </div>

      <div className="mt-3">
        <input
          type="text"
          placeholder="Suchbegriff (Marke, Modell, ...)"
          value={form.search}
          onChange={(e) => set("search", e.target.value)}
          className="bg-white text-gray-900 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </form>
  );
}
