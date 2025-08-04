import React, { useEffect, useState } from "react";
import axios from "axios";

// Low slot upgrades (for dropdown)
const LOW_SLOT_UPGRADES = [
  { name: "Mining Laser Upgrade II", bonus: 0.09 },
  { name: "Elara Restrained Mining Laser Upgrade", bonus: 0.08 },
  { name: "'Aoede' Mining Laser Upgrade", bonus: 0.10 },
  { name: "'Carpo' Mining Laser Upgrade", bonus: 0.09 },
  { name: "Mining Laser Upgrade I", bonus: 0.05 },
];

const IMPLANT_OPTIONS = [
  "None",
  "Inherent Implants 'Highwall' Mining MX-1001",
  "Inherent Implants 'Highwall' Mining MX-1003",
  "Inherent Implants 'Highwall' Mining MX-1005"
];

// At the top of your component:
const STRIP_MINERS = ["Strip Miner I", "Modulated Strip Miner II", "ORE Strip Miner"];
const EXPEDITION_FRIGATES = ["Prospect", "Endurance", "Venture"];

// Tooltip header component (matches GasCalc)
function InfoHead({ children, tip, id, className = "" }: { children: React.ReactNode; tip: string; id: string; className?: string; }) {
  return (
    <th
      scope="col"
      className={`border px-3 py-2 relative overflow-visible whitespace-nowrap ${className}`}
    >
      <span className="group/ih inline-flex items-center gap-1 cursor-help" aria-describedby={id}>
        {children}
        <span
          aria-hidden="true"
          className="
            inline-flex items-center justify-center
            w-4 h-4 sm:w-5 sm:h-5
            rounded-full
            border border-blue-400/40
            bg-blue-500/20
            text-[10px] sm:text-[11px] font-bold leading-none
            text-blue-200
            group-hover/ih:bg-blue-500/30 group-hover/ih:text-blue-100
            group-focus-within/ih:bg-blue-500/30 group-focus-within/ih:text-blue-100
            transition-colors duration-150
            translate-y-[1px]
          "
        >?</span>
        <div
          id={id}
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 hidden
                   group-hover/ih:block group-focus-within/ih:block
                   w-44 sm:w-56 max-w-xs px-2 py-1 rounded border border-gray-700 shadow-lg
                   bg-gray-900 text-[11px] leading-snug text-gray-100
                   whitespace-normal break-words pointer-events-none select-none"
        >
          {tip}
        </div>
      </span>
    </th>
  );
}

export default function OreCalculator() {
  // All config state, output, etc
  const [sortKey, setSortKey] = useState("iskPerHour"); // Default to ISK/hr
  const [sortAsc, setSortAsc] = useState(false); // Descending by default
  const [ores, setOres] = useState<Record<string, any>>({});
  const [modules, setModules] = useState<Record<string, any>>({});
  const [ships, setShips] = useState<string[]>([]);
  const [crystals, setCrystals] = useState<Record<string, any>>({});
  const [output, setOutput] = useState<any>(null);
  const [implant, setImplant] = useState("None");
  const [shipsObj, setShipsObj] = useState<Record<string, any>>({});

  // Helper for ship type (optionally, pull from your ship data json for "type")
function isBargeOrExhumer(shipName: string) {
  const data = shipsObj[shipName];
  return data?.type === "barge" || data?.type === "exhumer";
}

function isExpeditionFrigate(shipName: string) {
  return EXPEDITION_FRIGATES.includes(shipName);
}

  // Form config state
  const [config, setConfig] = useState({
    ship: "",
    module: "",
    numModules: 1,
    crystal: "",
    numShips: 1,
    lowSlotName: "",
    lowSlotCount: 0,
    skills: { barge: 0, exhumer: 0, frigate: 0, expedition: 0, mining: 0, astrogeology: 0 },
  });
  const [boost, setBoost] = useState({
    ship: "None",
    industrial: 0,
    director: 0,
    implant: "None",
    module: "T1",
    bastion: "No"
  });

  // Collapsible sections
  const [collapsed, setCollapsed] = useState({
    fleet: false,
    skills: false,
    lowslot: false,
    boosts: false,
  });
  const toggleSection = (section: keyof typeof collapsed) =>
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));

  // Data fetching on mount
  useEffect(() => {
    const fetchData = async () => {
const oreRes = await fetch("/api/data/ore_data.json");
const moduleRes = await fetch("/api/data/mining_modules.json");
const shipRes = await fetch("/api/data/mining_ship_bonuses.json");
const crystalRes = await fetch("/api/data/mining_crystals.json");

const oresData = await oreRes.json();
const modulesData = await moduleRes.json();
const shipsObjData = await shipRes.json();
const crystalsData = await crystalRes.json();

setOres(oresData);
setModules(modulesData);
setShips(Object.keys(shipsObjData));
setShipsObj(shipsObjData);
setCrystals(crystalsData);

    };
    fetchData();
  }, []);
const cycleTimeReduction = output?.cycleTimeReduction ?? 0;
  // Controlled input update
const updateConfig = (key: string, value: any) => {
  if (key === "module") {
    setConfig(c => ({
      ...c,
      module: value,
      crystal: value === "Modulated Strip Miner II" ? c.crystal : "",
    }));
  } else if (["numModules", "numShips", "lowSlotCount"].includes(key)) {
    setConfig(c => ({ ...c, [key]: parseInt(value) || 0 }));
  } else if (
    ["barge", "exhumer", "frigate", "expedition", "mining", "astrogeology"].includes(key)
  ) {
    setConfig(c => ({
      ...c,
      skills: { ...c.skills, [key]: parseInt(value) || 0 },
    }));
  } else {
    setConfig(c => ({ ...c, [key]: value }));
  }
};

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await axios.post("/api/ore-calc", { config, boost, implantName: implant });
    setOutput(res.data);
  };
const handleSort = (key: string) => {
  if (sortKey === key) setSortAsc(a => !a); // Flip sort
  else {
    setSortKey(key);
    setSortAsc(key === "ore" ? true : false); // Ores = A-Z, values = desc by default
  }
};

  // ========== UI Rendering ==============
  return (
    <div className="font-mono">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Info box */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded shadow-md text-sm text-gray-300">
          <p className="mb-1">
            You can <span className="font-semibold text-white">sort by any header</span> by clicking the name.
          </p>
          <p className="mb-1">
            <span className="font-semibold text-white">Customize your fleet</span> and skills below to see live ISK and yield for every ore. No, I will not update this to include Mercoxit, ice or moon ores. Yes, someday I will add support for mining drones. Not soon. 
          </p>
          <p>
            <span className="font-semibold text-white">Market prices</span> update hourly USING COMPRESSED ORE JITA BUY PRICES via{" "}
            <a href="https://market.fuzzwork.co.uk/" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">
              fuzzwork.co.uk
            </a>.
          </p>
        </div>

       <form onSubmit={handleSubmit} className="space-y-6">

  {/* === SHIP SECTION === */}
  <fieldset className="bg-[rgba(20,25,40,0.75)] shadow-md border border-gray-750 rounded">
    <legend
      onClick={() => toggleSection("fleet")}
      className="text-lg font-semibold text-gray-300 px-4 py-2 cursor-pointer flex justify-between items-center select-none bg-gray-800 border-b border-gray-600"
    >
      Ship
      <span className="text-sm text-gray-400">{collapsed.fleet ? " ▼" : " ▲"}</span>
    </legend>
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed.fleet ? "max-h-0 p-0" : "p-4 max-h-[1000px]"}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ship name */}
        <div className="flex flex-col">
          <label htmlFor="ship" className="mb-1 text-sm">Ship</label>
          <select id="ship" name="ship" value={config.ship} onChange={e => updateConfig("ship", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm">
            <option value="">Select Ship</option>
            {ships.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Module */}
{/* Module */}
<div className="flex flex-col">
  <label htmlFor="module" className="mb-1 text-sm">High slot Module</label>
  <select
    id="module"
    name="module"
    value={config.module}
    onChange={e => updateConfig("module", e.target.value)}
    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
  >
    <option value="">Select Module</option>
    {isBargeOrExhumer(config.ship)
      ? STRIP_MINERS.map(m => <option key={m} value={m}>{m}</option>)
      : isExpeditionFrigate(config.ship)
        ? Object.keys(modules)
            .filter(m => !STRIP_MINERS.includes(m))
            .map(m => <option key={m} value={m}>{m}</option>)
        : Object.keys(modules).map(m => <option key={m} value={m}>{m}</option>)
    }
  </select>
</div>

        {/* Num Modules */}
        <div className="flex flex-col">
          <label htmlFor="numModules" className="mb-1 text-sm">Number of Modules</label>
          <input id="numModules" name="numModules" type="number" min="1"
            value={config.numModules} onChange={e => updateConfig("numModules", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-full min-w-[80px]" />
        </div>
        {/* Num Ships */}
        <div className="flex flex-col">
          <label htmlFor="numShips" className="mb-1 text-sm">Number of Ships</label>
          <input id="numShips" name="numShips" type="number" min="1"
            value={config.numShips} onChange={e => updateConfig("numShips", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-full min-w-[80px]" />
        </div>
        {/* Low slot module */}
        <div className="flex flex-col">
          <label htmlFor="lowSlotName" className="mb-1 text-sm">Low Slot Module</label>
          <select
            id="lowSlotName"
            name="lowSlotName"
            value={config.lowSlotName}
            onChange={e => updateConfig("lowSlotName", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="">No Low Slot</option>
            {LOW_SLOT_UPGRADES.map(upg => (
              <option key={upg.name} value={upg.name}>{upg.name}</option>
            ))}
          </select>
        </div>
        {/* Number of low slots */}
        <div className="flex flex-col">
          <label htmlFor="lowSlotCount" className="mb-1 text-sm">Number of low Slots</label>
          <input
            id="lowSlotCount"
            name="lowSlotCount"
            type="number"
            min="0"
            max="8"
            value={config.lowSlotCount}
            onChange={e => updateConfig("lowSlotCount", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-full min-w-[80px]"
          />
        </div>
        {/* Crystal */}
        <div className="flex flex-col">
          <label htmlFor="crystal" className="mb-1 text-sm">Mining Crystal</label>
<select
  id="crystal"
  name="crystal"
  value={config.crystal}
  onChange={e => updateConfig("crystal", e.target.value)}
  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
  disabled={config.module !== "Modulated Strip Miner II"}
>
  <option value="">No Crystal</option>
  {config.module === "Modulated Strip Miner II" &&
    Object.keys(crystals).map(c => <option key={c} value={c}>{c}</option>)
  }
</select>
        </div>
      </div>
    </div>
  </fieldset>

  {/* === CHARACTER SECTION === */}
  <fieldset className="bg-[rgba(20,25,40,0.75)] shadow-md border border-gray-750 rounded">
    <legend
      onClick={() => toggleSection("skills")}
      className="text-lg font-semibold text-gray-300 px-4 py-2 cursor-pointer flex justify-between items-center select-none bg-gray-800 border-b border-gray-600"
    >
      Character
      <span className="text-sm text-gray-400">{collapsed.skills ? " ▼" : " ▲"}</span>
    </legend>
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed.skills ? "max-h-0 p-0" : "p-4 max-h-[1000px]"}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Frigate level */}
        <div className="flex flex-col">
          <label htmlFor="frigate" className="mb-1 text-sm">Mining Frigate Level</label>
          <input id="frigate" name="frigate" type="number" min="0" max="5"
            value={config.skills.frigate}
            onChange={e => updateConfig("frigate", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" />
        </div>
        {/* Expedition level */}
        <div className="flex flex-col">
          <label htmlFor="expedition" className="mb-1 text-sm">Expedition Frigate Level</label>
          <input id="expedition" name="expedition" type="number" min="0" max="5"
            value={config.skills.expedition}
            onChange={e => updateConfig("expedition", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" />
        </div>
        {/* Barge level */}
        <div className="flex flex-col">
          <label htmlFor="barge" className="mb-1 text-sm">Mining Barge Level</label>
          <input id="barge" name="barge" type="number" min="0" max="5"
            value={config.skills.barge}
            onChange={e => updateConfig("barge", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" />
        </div>
        {/* Exhumer level */}
        <div className="flex flex-col">
          <label htmlFor="exhumer" className="mb-1 text-sm">Exhumers Level</label>
          <input id="exhumer" name="exhumer" type="number" min="0" max="5"
            value={config.skills.exhumer}
            onChange={e => updateConfig("exhumer", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" />
        </div>
        {/* Mining level */}
        <div className="flex flex-col">
          <label htmlFor="mining" className="mb-1 text-sm">Mining Level</label>
          <input id="mining" name="mining" type="number" min="0" max="5"
            value={config.skills.mining}
            onChange={e => updateConfig("mining", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" />
        </div>
        {/* Astrogeology level */}
        <div className="flex flex-col">
          <label htmlFor="astrogeology" className="mb-1 text-sm">Astrogeology Level</label>
          <input id="astrogeology" name="astrogeology" type="number" min="0" max="5"
            value={config.skills.astrogeology}
            onChange={e => updateConfig("astrogeology", e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" />
        </div>
        {/* Implant */}
        <div className="flex flex-col">
          <label htmlFor="implant" className="mb-1 text-sm text-gray-300 font-medium">Implant</label>
          <select
            id="implant"
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
            value={implant}
            onChange={e => setImplant(e.target.value)}
          >
            {IMPLANT_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {/* Placeholder/ignore box */}
        <div />
      </div>
    </div>
  </fieldset>

  {/* === BOOSTS SECTION === */}
  <fieldset className="bg-[rgba(20,25,40,0.75)] shadow-md border border-gray-750 rounded">
    <legend
      onClick={() => toggleSection("boosts")}
      className="text-lg font-semibold text-gray-300 px-4 py-2 cursor-pointer flex justify-between items-center select-none bg-gray-800 border-b border-gray-600"
    >
      Boosts
      <span className="text-sm text-gray-400">{collapsed.boosts ? " ▼" : " ▲"}</span>
    </legend>
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed.boosts ? "max-h-0 p-0" : "p-4 max-h-[1000px]"}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Boost Ship */}
        <div className="flex flex-col">
          <label htmlFor="boostShip" className="mb-1 text-sm">Boost Ship</label>
          <select
            id="boostShip"
            name="boostShip"
            value={boost.ship}
            onChange={e => setBoost(b => ({ ...b, ship: e.target.value }))}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            {["None", "Orca", "Porpoise", "Gnosis"].map(ship => (
              <option key={ship} value={ship}>{ship}</option>
            ))}
          </select>
        </div>
        {/* Industrial Command Ships */}
        <div className="flex flex-col">
          <label htmlFor="industrial" className="mb-1 text-sm">Industrial Command Ships</label>
          <input
            id="industrial"
            name="industrial"
            type="number"
            min="0"
            max="5"
            value={boost.industrial}
            onChange={e => setBoost(b => ({ ...b, industrial: parseInt(e.target.value) || 0 }))}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-full min-w-[80px]"
          />
        </div>
        {/* Mining Director */}
        <div className="flex flex-col">
          <label htmlFor="director" className="mb-1 text-sm">Mining Director</label>
          <input
            id="director"
            name="director"
            type="number"
            min="0"
            max="5"
            value={boost.director}
            onChange={e => setBoost(b => ({ ...b, director: parseInt(e.target.value) || 0 }))}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-full min-w-[80px]"
          />
        </div>
        {/* Boost Implant */}
        <div className="flex flex-col">
          <label htmlFor="implant" className="mb-1 text-sm">Boost Implant</label>
          <select
            id="implant"
            name="implant"
            value={boost.implant}
            onChange={e => setBoost(b => ({ ...b, implant: e.target.value }))}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="None">No</option>
            <option value="mindlink">Yes</option>
          </select>
        </div>
        {/* Module Type */}
        <div className="flex flex-col">
          <label htmlFor="module" className="mb-1 text-sm">Boost Type</label>
          <select
            id="module"
            name="module"
            value={boost.module}
            onChange={e => setBoost(b => ({ ...b, module: e.target.value }))}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="T1">T1</option>
            <option value="T2">T2</option>
          </select>
        </div>
        {/* Bastion Mode */}
        <div className="flex flex-col">
          <label htmlFor="bastion" className="mb-1 text-sm">Industrial Core</label>
          <select
            id="bastion"
            name="bastion"
            value={boost.bastion}
            onChange={e => setBoost(b => ({ ...b, bastion: e.target.value }))}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
      </div>
    </div>
  </fieldset>

  {/* === Calculate Button === */}
  <div className="flex justify-end pt-4">
    <button
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl shadow font-semibold text-lg tracking-wide transition"
      type="submit"
    >
      Calculate
    </button>
  </div>
</form>


        {/* Display cycle and yield stats */}
        {output && (
          <>
            <div className="flex gap-10 items-center justify-center mt-10 mb-2 text-base">
              <div className="bg-gray-800/80 border border-gray-700 rounded-xl px-6 py-3 shadow text-xl">
                <span className="font-semibold text-blue-300">Cycle Time:</span> <span className="text-white">{output.cycleTime?.toFixed(2)}</span> <span className="text-gray-300">s</span>
              </div>
              <div className="bg-gray-800/80 border border-gray-700 rounded-xl px-6 py-3 shadow text-xl">
                <span className="font-semibold text-blue-300">Yield/Cycle:</span> <span className="text-white">{output.yieldPerCycle?.toFixed(2)}</span> <span className="text-gray-300">m³</span>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-700 shadow mt-8">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="bg-gray-900/95">
<InfoHead id="ore1" tip="Type of ore">
  <span
    className="cursor-pointer select-none"
    onClick={() => handleSort("ore")}
  >
    Ore {sortKey === "ore" && (sortAsc ? "▲" : "▼")}
  </span>
</InfoHead>
<InfoHead id="isk1" tip="Highest buy price in Jita, per unit">
  <span
    className="cursor-pointer select-none"
    onClick={() => handleSort("iskPerUnit")}
  >
    ISK/unit {sortKey === "iskPerUnit" && (sortAsc ? "▲" : "▼")}
  </span>
</InfoHead>
<InfoHead id="units1" tip="Total raw ore units produced per hour">
  <span
    className="cursor-pointer select-none"
    onClick={() => handleSort("unitsPerHour")}
  >
    Units/hr {sortKey === "unitsPerHour" && (sortAsc ? "▲" : "▼")}
  </span>
</InfoHead>
<InfoHead id="iskhr1" tip="Estimated ISK per hour (highest buyer)">
  <span
    className="cursor-pointer select-none"
    onClick={() => handleSort("iskPerHour")}
  >
    ISK/hr {sortKey === "iskPerHour" && (sortAsc ? "▲" : "▼")}
  </span>
</InfoHead>

                  </tr>
                </thead>
                <tbody>
                  {Object.entries(output.result || {})
  .sort((a: any, b: any) => {
    let valA, valB;
    if (sortKey === "ore") {
      valA = a[0];
      valB = b[0];
    } else {
      valA = a[1][sortKey] ?? 0;
      valB = b[1][sortKey] ?? 0;
    }
    if (typeof valA === "string") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  })
  .map(([ore, data]: any, idx) => (
                    <tr key={ore} className={idx % 2 === 0 ? "bg-gray-900/80" : "bg-gray-800/70"}>
                      <td className="p-2 border">{ore}</td>
                      <td className="p-2 border">{(data.iskPerUnit ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-2 border">{(data.unitsPerHour ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="p-2 border font-semibold">{(data.iskPerHour ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
