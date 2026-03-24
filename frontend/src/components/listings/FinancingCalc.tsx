"use client";
import { useState } from "react";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";

interface Props { priceChf: number }

const TERMS = [24, 36, 48, 60, 72, 84];

export function FinancingCalc({ priceChf }: Props) {
  const [open, setOpen] = useState(false);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(3.9);
  const [months, setMonths] = useState(48);

  const down = Math.round(priceChf * downPct / 100);
  const loan = priceChf - down;
  const r = rate / 100 / 12;
  const monthly = r === 0 ? loan / months : Math.round(loan * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
  const total = monthly * months + down;
  const interest = total - priceChf;

  const fmt = (n: number) => `CHF ${Math.round(n).toLocaleString("de-CH")}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">Finanzierungsrechner</p>
            {!open && <p className="text-xs text-gray-400 mt-0.5">Ab ca. {fmt(monthly)}/Mt.</p>}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-5 border-t border-gray-100 space-y-4 animate-fade-in-up">
          {/* Monthly payment hero */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center mt-3">
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Monatliche Rate</p>
            <p className="text-3xl font-bold text-emerald-700">{fmt(monthly)}</p>
            <p className="text-xs text-emerald-500 mt-1">{months} Monate · {rate}% p.a.</p>
          </div>

          {/* Down payment */}
          <div>
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
              <span>Anzahlung ({downPct}%)</span>
              <span className="text-gray-900 font-bold">{fmt(down)}</span>
            </div>
            <input
              type="range" min={0} max={50} step={5} value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>0%</span><span>50%</span>
            </div>
          </div>

          {/* Interest rate */}
          <div>
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
              <span>Zinssatz</span>
              <span className="text-gray-900 font-bold">{rate}% p.a.</span>
            </div>
            <input
              type="range" min={1} max={12} step={0.5} value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>1%</span><span>12%</span>
            </div>
          </div>

          {/* Term buttons */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Laufzeit</p>
            <div className="grid grid-cols-6 gap-1">
              {TERMS.map((t) => (
                <button
                  key={t}
                  onClick={() => setMonths(t)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${months === t ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {t}M
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400">Kreditbetrag</p>
              <p className="font-bold text-gray-800 mt-0.5">{fmt(loan)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400">Gesamtkosten</p>
              <p className="font-bold text-gray-800 mt-0.5">{fmt(total)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2.5 col-span-2">
              <p className="text-orange-400">Gesamtzinsen</p>
              <p className="font-bold text-orange-600 mt-0.5">{fmt(interest)}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-300 text-center">Unverbindliche Berechnung. Tatsächliche Konditionen beim Finanzierungspartner.</p>
        </div>
      )}
    </div>
  );
}
