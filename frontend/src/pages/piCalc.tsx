import React, { useState, useEffect } from "react";

const TIERS = ["P1", "P2", "P3", "P4"];
const MODES = [
  { key: "sell", label: "Jita Sell", color: "bg-green-700" },
  { key: "buy", label: "Jita Buy", color: "bg-red-700" },
  { key: "impatient", label: "Impatient Industrialist", color: "bg-orange-500" },
  { key: "patient", label: "Patient Capitalist", color: "bg-blue-700" },
];

export default function PiCalc() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [tax, setTax] = useState(0);
  const [mode, setMode] = useState("sell");
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    P1: false, P2: false, P3: false, P4: false
  });

  const calc = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pi/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxRate: tax, marketMode: mode }),
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      setData({});
    }
    setLoading(false);
  };

  useEffect(() => {
    calc();
    // eslint-disable-next-line
  }, []);

  function getProfitColor(val: number, max: number) {
    if (val < 0) return "text-red-400";
    if (max === 0) return "text-green-300";
    const pct = Math.min(val / max, 1);
    if (pct > 0.85) return "text-green-700 font-bold";
    if (pct > 0.65) return "text-green-600 font-bold";
    if (pct > 0.45) return "text-green-500 font-semibold";
    if (pct > 0.25) return "text-green-400";
    return "text-green-300";
  }

  function renderTable(tier: string, items: any[]) {
    const maxP0 = Math.max(0, ...items.map((row: any) => row.profitP0This ?? 0));
    const maxPrev = Math.max(0, ...items.map((row: any) => row.profitPrevThis ?? 0));
    if (!items?.length) return null;
    return (
      <div className="mb-10" key={tier}>
<div
  className="flex items-center justify-between mb-2 px-4 py-2 rounded-lg bg-gray-700 border border-gray-500 shadow transition-all"
  style={{ minHeight: "48px" }}
>
  <h2 className="text-xl font-bold tracking-tight text-white drop-shadow">
    {tier} Products
  </h2>
  <button
    className={`ml-3 px-4 py-2 rounded font-bold text-base border transition-colors
      ${expanded[tier]
        ? "bg-red-700 text-white border-red-800 hover:bg-red-800"
        : "bg-gray-600 text-gray-100 border-gray-400 hover:bg-green-600 hover:text-white"
      }`}
    onClick={() => setExpanded(exp => ({ ...exp, [tier]: !exp[tier] }))}
    style={{ minWidth: "90px" }}
  >
    {expanded[tier] ? "Collapse" : "Expand"}
  </button>
</div>

        {expanded[tier] && (
          <div className="overflow-x-auto border border-gray-700 rounded shadow-md mb-8 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800">
            <table className="table-auto w-full text-sm border border-gray-700 font-mono">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="border px-3 py-2">Item Name</th>
                  <th className="border px-3 py-2">Batch Qty</th>
                  <th className="border px-3 py-2">Lowest Seller<br />(unit)</th>
                  <th className="border px-3 py-2">Highest Buyer<br />(unit)</th>
                  <th className="border px-3 py-2">Value × Batch</th>
                  <th className="border px-3 py-2">Ingredient 1</th>
                  <th className="border px-3 py-2">Ingredient 2</th>
                  <th className="border px-3 py-2">Ingredient 3</th>
                  <th className="border px-3 py-2">Profit P0–This × Batch</th>
                  <th className="border px-3 py-2">Profit Prev–This × Batch</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row: any, idx: number) => (
                  <tr
                    key={row.name}
                    className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}
                  >
                    <td className="border px-3 py-2">{row.name}</td>
                    <td className="border px-3 py-2 text-center">{row.quantity}</td>
                    <td className="border px-3 py-2 text-right">{row.lowestSeller?.toLocaleString() ?? ""}</td>
                    <td className="border px-3 py-2 text-right">{row.highestBuyer?.toLocaleString() ?? ""}</td>
                    <td className="border px-3 py-2 text-right font-semibold">
                      {row.valueBatch?.toLocaleString() ?? ""}
                    </td>
                    <td className="border px-3 py-2">{row.ingredients[0]?.name || "-"}</td>
                    <td className="border px-3 py-2">{row.ingredients[1]?.name || "-"}</td>
                    <td className="border px-3 py-2">{row.ingredients[2]?.name || "-"}</td>
                    <td className={`border px-3 py-2 text-right ${getProfitColor(row.profitP0This, maxP0)}`}>
                      {Math.round(row.profitP0This).toLocaleString()}
                    </td>
                    <td className={`border px-3 py-2 text-right ${getProfitColor(row.profitPrevThis, maxPrev)}`}>
                      {Math.round(row.profitPrevThis).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="font-mono">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded shadow-md text-sm text-gray-300">
          <p className="mb-1">
            📦 <span className="font-semibold text-white">Calculate planetary production profit</span> for every PI item (P1–P4) using live Jita prices (from Fuzzworks).
          </p>
          <span className="font-bold text-accent">How to use:</span>
          <ul className="list-disc ml-8 mb-1">
            <li>
              <b>POCO Tax:</b> Set the tax rate to match your planet's Customs Office.
            </li>
            <li>
              <b>Market Mode:</b> Switch between four calculation styles:
              <ul className="list-disc ml-8">
                <li>
                  <b>Jita Sell:</b> All inputs and outputs priced using current sell orders.<br />
                  <span className="text-gray-400">— Most accurate if you buy everything from sell orders and sell via sell orders.</span>
                </li>
                <li>
                  <b>Jita Buy:</b> All inputs and outputs priced using current buy orders.<br />
                  <span className="text-gray-400">— As if you place buy orders for everything and immediately sell to buy orders.</span>
                </li>
                <li>
                  <b>Impatient Industrialist:</b> <span className="text-green-600">Buys from sell orders, sells to buy orders.</span><br />
                  <span className="text-gray-400">— For quick flipping or immediate order execution (no open orders).</span>
                </li>
                <li>
                  <b>Patient Capitalist:</b> <span className="text-blue-500">Buys from buy orders, sells to sell orders.</span><br />
                  <span className="text-gray-400">— Max-profit, max-patience mode for real marketeers.</span>
                </li>
              </ul>
            </li>
            <li>
              <b>Profit Columns:</b>
              <ul className="list-disc ml-8">
                <li>
                  <b>Profit P0–This:</b> Total profit if you extract P0 and build all steps yourself.
                </li>
                <li>
                  <b>Profit Prev–This:</b> Profit for the final step only (e.g., if turning your P2 into P3 is profitable).
                </li>
              </ul>
            </li>
          </ul>
        </div>
        {/* NEW: Responsive full-width controls bar */}
<div className="flex gap-3 mb-8 w-full">
  {/* Market Modes: Takes up all available space */}
  <div className="flex flex-1 items-center bg-gray-800 px-3 py-2 rounded shadow border border-gray-700 min-w-[300px]">
    <span className="font-semibold mr-2">Market mode:</span>
    <div className="flex gap-2 flex-1">
      {MODES.map((m) => (
        <button
          key={m.key}
          className={`flex-1 px-0 py-2 rounded-lg font-bold border-2 border-transparent transition-colors duration-150
            ${mode === m.key
              ? m.color + " text-white border-white shadow"
              : "bg-gray-900 hover:bg-gray-700"}
          `}
          onClick={() => setMode(m.key)}
        >
          {m.label}
        </button>
      ))}
    </div>
  </div>
  {/* POCO Tax: Shrinks to content, fills row height */}
  <div className="flex items-center bg-gray-800 px-3 py-2 rounded shadow border border-gray-700 min-w-[180px]">
    <span className="font-semibold mr-2">POCO Tax (%):</span>
    <input
      type="number"
      min={0}
      max={50}
      value={tax}
      onChange={e => setTax(Number(e.target.value))}
      className="border rounded px-2 py-2 w-20 bg-gray-900 border-gray-600 font-mono"
    />
  </div>
  {/* Calculate: Full height/width of row */}
  <button
    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow px-6 w-full max-w-[180px] transition-colors duration-200"
    style={{ minHeight: "48px" }}
    onClick={calc}
    disabled={loading}
  >
    Calculate
  </button>
</div>
        {loading && <div className="text-blue-400 animate-pulse mb-4">Calculating...</div>}
        {Object.keys(data).length > 0 && (
          <div>
            {TIERS.map(tier => renderTable(tier, (data as any)[tier]))}
          </div>
        )}
      </div>
    </div>
  );
}
