import { useState } from "react";

export default function BlootCalc() {
  const [siteTier, setSiteTier] = useState("C5");
  const [siteRuns, setSiteRuns] = useState({});
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [results, setResults] = useState([]);
  const [totalISK, setTotalISK] = useState(0);
  const [accounting, setAccounting] = useState(5);
  const [drifterRan, setDrifterRan] = useState(true);
  const [useDpsLogiMode, setUseDpsLogiMode] = useState(false);



  const removePlayer = (index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const siteData = {
    C5: [
      "Core Garrison",
      "Core Stronghold",
      "Oruze Osobnyk",
      "Quarantine Area",
      "Unsecured Frontier Enclave Relay",
      "Unsecured Frontier Server Bank",
      "Forgotten Core Data Field",
      "Forgotten Core Information Pen"
    ],
    C6: [
      "Core Bastion",
      "Core Citadel",
      "Strange Energy Readings",
      "The Mirror",
      "Unsecured Core Backup Array",
      "Unsecured Core Emergence",
      "Forgotten Core Assembly Hall",
      "Forgotten Core Circuitry Disassembler"
    ]
  };

  const handleSiteChange = (site, value) => {
    setSiteRuns((prev) => ({ ...prev, [site]: parseInt(value) || 0 }));
  };

const addPlayer = () => {
  if (!playerName.trim()) return;

  const base = {
    name: playerName.trim(),
    bubbler: false,
    extraShares: 0,
  };

  const player = useDpsLogiMode
    ? { ...base, dps: 0, logi: 0 }
    : { ...base, marauders: 0, dread: 0 };

  setPlayers([...players, player]);
  setPlayerName("");
};


const updatePlayer = (index, field, value) => {
  const updated = [...players];
  if (field === "bubbler") {
    updated[index][field] = value;
  } else if (field === "extraShares") {
    updated[index][field] = parseFloat(value) || 0;
  } else {
    updated[index][field] = parseInt(value) || 0;
  }
  setPlayers(updated);
};


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formattedSiteRuns = Object.entries(siteRuns).map(([siteName, count]) => ({
    siteName,
    count,
    usedDread: players.some((p) => p.dread > 0),
    useDpsLogiMode,
  }));

  try {
    const response = await fetch("/api/blue-loot-calc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ siteRuns: formattedSiteRuns, players, accounting, drifterRan }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Server error:", errText);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    setResults(data.payouts);
    setTotalISK(data.totalISK); // 💰 add this
  } catch (error) {
    console.error("Failed to fetch results:", error);
  }
};

const tooltipStyle = "relative group cursor-help";
const tooltipBox = "absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition z-10 w-64 text-left whitespace-normal pointer-events-none";


  return (
    <>
    <div className="font-mono">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-blue-100 border border-gray-700 rounded-md p-4 text-sm mb-6 shadow-sm">
  This tool calculates a fair (share based) ISK split for C5 and C6 wormhole sites based on how many ships each player brought — including tiered share system for multiboxed marauders, dreads, and tackle. Just enter the number of sites and ships used, and it handles the math for you. Upgraded Avenger and big drifter loot are automatically included if a dread is in fleet composition and the "Drifter ran?" box is "Yes".
</div>
      <div className="max-w-4xl mx-auto bg-[rgba(20,25,40,0.75)] backdrop-blur-sm border border-gray-700 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">📦 Blue Loot Split Calculator</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
{/* Site Runs */}
<div>
  <h3 className="text-lg font-semibold mb-2">1. Sites Run</h3>
<div className="mb-2 flex flex-row items-center gap-x-6">
  <span className="flex flex-row items-center">
    <label className="mr-2">Select Site Tier:</label>
    <select
      value={siteTier}
      onChange={(e) => setSiteTier(e.target.value)}
      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
    >
      <option value="C5">C5</option>
      <option value="C6">C6</option>
    </select>
  </span>
  <span className="flex flex-row items-center">
    <label className="mr-2">Accounting Level:</label>
    <select
      value={accounting}
      onChange={e => setAccounting(Number(e.target.value))}
      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
    >
      {[0,1,2,3,4,5].map(level =>
        <option key={level} value={level}>{level}</option>
      )}
    </select>
  </span>
</div>

  {/* Compact two-column grid with side-by-side label + small input */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
    {siteData[siteTier].map((site) => (
      <div key={site} className="flex items-center justify-between">
        <label className="text-sm font-bold truncate mr-2">{site}</label>
        <input
          type="number"
          min="0"
          value={siteRuns[site] || ""}
          onChange={(e) => handleSiteChange(site, e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm w-20 text-right"
          placeholder="0"
        />
      </div>
    ))}
  </div>
</div>
<div className="mt-4 flex items-center gap-4">
  <label className="text-lg font-semibold text-red-300">Drifter ran?</label>
  <select
    value={drifterRan ? "yes" : "no"}
    onChange={(e) => setDrifterRan(e.target.value === "yes")}
    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
  >
    <option value="yes">Yes</option>
    <option value="no">No</option>
  </select>
</div>

          {/* Player Setup */}
          <div>
            <h3 className="text-lg font-semibold mb-2">2. Player Setup</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPlayer();
                  }
                }}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={addPlayer}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
              >
                Add
              </button>
            </div>

 <div className="space-y-2">
<div className="flex items-center gap-3 mb-4">
  <span className="text-sm font-semibold">Share Mode:</span>

  <div className="flex rounded-full overflow-hidden border border-gray-600 text-sm">
    <button
      className={`px-3 py-1 transition ${
        !useDpsLogiMode
          ? "bg-blue-600 text-white"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
      onClick={() => {
        if (useDpsLogiMode) {
          // switching to Dread/Marauder
          const updated = players.map((p) => ({
            name: p.name,
            marauders: 0,
            dread: 0,
            bubbler: p.bubbler || false,
            extraShares: p.extraShares || 0,
          }));
          setPlayers(updated);
          setUseDpsLogiMode(false);
        }
      }}
    >
      Dread / Marauder
    </button>
    <button
      className={`px-3 py-1 transition ${
        useDpsLogiMode
          ? "bg-blue-600 text-white"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
      onClick={() => {
        if (!useDpsLogiMode) {
          // switching to DPS/Logi
          const updated = players.map((p) => ({
            name: p.name,
            dps: 0,
            logi: 0,
            bubbler: p.bubbler || false,
            extraShares: p.extraShares || 0,
          }));
          setPlayers(updated);
          setUseDpsLogiMode(true);
        }
      }}
    >
      DPS / Logi
    </button>
  </div>

<div className={tooltipStyle + " flex items-center justify-center gap-1"}>
  <span> </span>
  <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="currentColor"
  className="w-4 h-4 text-gray-400 group-hover:text-white transition"
>
  <path
    fillRule="evenodd"
    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.01 17a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm1.61-7.84-.9.92c-.68.7-1.01 1.27-1.01 2.42h-1.5v-.38c0-1.1.33-1.93 1.11-2.74l1.24-1.26c.38-.39.55-.83.55-1.31 0-1.02-.84-1.85-1.87-1.85s-1.87.83-1.87 1.85H8c0-1.83 1.52-3.35 3.38-3.35S14.75 8.7 14.75 10c0 .78-.29 1.44-.83 1.96z"
    clipRule="evenodd"
  />
</svg>
  <div className={tooltipBox}>
    Toggle between Marauders/Dreads or Logi/DPS<br />
    (dread payouts account for avengers and big drifter if applicable.)<br />
    <br />
    Logi/DPS mode is meant to handle Leshak/Nestor and WR fleets, with adjusted payouts.
  </div>
</div>

</div>

  {players.length > 0 && (
<div className="grid grid-cols-[8rem_6rem_6rem_6rem_6rem_4rem] gap-3 text-sm text-gray-400 text-center font-semibold mb-1 px-1">
  <div>Name</div>
  {useDpsLogiMode ? (
    <>
      <div>DPS</div>
      <div>Logi</div>
    </>
  ) : (
    <>
      <div>Marauders</div>
      <div>Dreads</div>
    </>
  )}
  <div>Tackle</div>
<div className={tooltipStyle + " flex items-center justify-center gap-1"}>
  <span>+ Shares</span>
  <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="currentColor"
  className="w-4 h-4 text-gray-400 group-hover:text-white transition"
>
  <path
    fillRule="evenodd"
    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.01 17a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm1.61-7.84-.9.92c-.68.7-1.01 1.27-1.01 2.42h-1.5v-.38c0-1.1.33-1.93 1.11-2.74l1.24-1.26c.38-.39.55-.83.55-1.31 0-1.02-.84-1.85-1.87-1.85s-1.87.83-1.87 1.85H8c0-1.83 1.52-3.35 3.38-3.35S14.75 8.7 14.75 10c0 .78-.29 1.44-.83 1.96z"
    clipRule="evenodd"
  />
</svg>
  <div className={tooltipBox}>
    Use this if someone brought something abnormal, like a vindi or booster. You can also use this for boosting soloboxer and newbro shares, or tipping your scanner/eyes/rollers.
  </div>
</div>

  <div>Delete</div>
</div>

  )}

  {players.map((player, index) => (
    <div key={index} className="grid grid-cols-[8rem_6rem_6rem_6rem_6rem_4rem] gap-3 items-center px-1">
      <span className="text-center">{player.name}</span>

{useDpsLogiMode ? (
  <>
    <input
      type="number"
      inputMode="numeric"
      value={player.dps || ""}
      onChange={(e) => updatePlayer(index, "dps", e.target.value)}
      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center"
    />
    <input
      type="number"
      inputMode="numeric"
      value={player.logi || ""}
      onChange={(e) => updatePlayer(index, "logi", e.target.value)}
      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center"
    />
  </>
) : (
  <>
    <input
      type="number"
      inputMode="numeric"
      value={player.marauders || ""}
      onChange={(e) => updatePlayer(index, "marauders", e.target.value)}
      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center"
    />
    <input
      type="number"
      inputMode="numeric"
      value={player.dread || ""}
      onChange={(e) => updatePlayer(index, "dread", e.target.value)}
      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center"
    />
  </>
)}


      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={player.bubbler}
          onChange={(e) => updatePlayer(index, "bubbler", e.target.checked)}
        />
      </div>
<input
  type="number"
  inputMode="decimal"
  value={player.extraShares || ""}
  onChange={(e) => updatePlayer(index, "extraShares", e.target.value)}
  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center"
/>

      <button
        type="button"
        onClick={() => removePlayer(index)}
        className="text-red-500 hover:text-red-700 text-lg"
      >
        ❌
      </button>
    </div>
  ))}
</div>

          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
          >
            Calculate
          </button>
        </form>

        {results.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4 text-white">
              Payout Breakdown — {(totalISK / 1_000_000_000).toFixed(1)}b ISK
            </h2>
        {results.length > 0 && (
  <div className="mt-4 text-blue-300 font-semibold">
    Applied Broker Tax: <span className="font-mono">{(7.5 - 0.462 * accounting).toFixed(2)}%</span>
  </div>
)}
            <table className="table-auto w-full text-sm border border-gray-700 bg-gray-800 text-white">
              <thead className="bg-gray-900">
                <tr>
                  <th className="border px-3 py-2">Player</th>
                  <th className="border px-3 py-2">Total Shares</th>
                  <th className="border px-3 py-2">ISK Earned</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
                    <td className="border px-3 py-2">{r.name}</td>
                    <td className="border px-3 py-2">{r.shares}</td>
                    <td className="border px-3 py-2">
{(r.payout ?? 0).toLocaleString(undefined, {
  maximumFractionDigits: 0,
})}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
{useDpsLogiMode ? (
  <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-blue-100 border border-gray-700 rounded-md p-4 text-sm mb-6 shadow-sm">
    <p className="text-white font-semibold">FC's: If you have a few people who can only fly logi *or* DPS and a few who are flying *both* logi and DPS, consider adding shares to the single-type players or subtracting (negative values in the extra shares column) from the dual type players to bring things in line. Or requesting only Logi and only DPS per player.</p>
    <p className="text-white font-semibold mt-3">Share Allocation for DPS:</p>
    <ul className="list-disc list-inside">
      <li><span>First 2 DPS ships:</span> +1.0 </li>
      <li><span>Next 3 DPS ships:</span> +0.5 </li>
      <li><span>Each additional:</span> +0.25 shares each</li>
    </ul>
    <p className="text-white font-semibold mt-3">Share Allocation for Logi:</p>
    <ul className="list-disc list-inside">
      <li><span>First logi ship:</span> +1.5 shares</li>
      <li><span>Second logi ship:</span> +0.75 shares</li>
      <li><span>Each additional:</span> +0.25 shares</li>
    </ul>
    <p className="text-white font-semibold mt-3">Tackle/Bubbler:</p>
    <p>+0.5 shares</p>
  </div>
) : (
  <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-blue-100 border border-gray-700 rounded-md p-4 text-sm mb-6 shadow-sm">
    <p className="text-white font-semibold">Share Allocation for Marauders:</p>
    <ul className="list-disc list-inside">
      <li><span>First Marauder:</span> +1.5</li>
      <li><span>Second Marauder:</span> +1.0</li>
      <li><span>Each additional:</span> +0.5</li>
    </ul>
    <p className="text-white font-semibold mt-3">Share Allocation for Dreads:</p>
    <ul className="list-disc list-inside">
      <li><span>First Dread:</span> +2.5</li>
      <li><span>Each additional:</span> +1.5</li>
    </ul>
    <p className="text-white font-semibold mt-3">Tackle/Bubbler:</p>
    <p>+0.5 shares</p>
  </div>
)}

    </div>
    </>
  );
}
