import { useState } from "react";
import axios from "axios";

const ships = [
  "Unbonused Ship", "Venture", "Prospect", "Covetor", "Retriever", "Procurer", "Hulk", "Skiff", "Mackinaw"
];


const implants = [
  { label: "None", value: 0 },
  { label: "GH-801 (+1%)", value: 0.01 },
  { label: "GH-803 (+3%)", value: 0.03 },
  { label: "GH-805 (+5%)", value: 0.05 }
];

const boostShips = ["None", "Gnosis", "Porpoise", "Orca"];

const boostImplants = [
  { label: "None", value: "none" },
  { label: "Mining Mindlink", value: "mindlink" },
  { label: "ORE Mining Director", value: "ore" }
];

const boostModules = [
  { label: "Burst I", value: "T1" },
  { label: "Burst II", value: "T2" }
];

type InfoHeadProps = {
  children: React.ReactNode;  // header label contents (e.g., "M³ Lost")
  tip: string;                // tooltip text
  id: string;                 // unique id per header
  className?: string;
};


function InfoHead({
  children,
  tip,
  className = "",
  id,
}: {
  children: React.ReactNode;
  tip: string;
  className?: string;
  id: string;
}) {
  return (
    <th
      scope="col"
      className={`border px-3 py-2 relative overflow-visible whitespace-nowrap ${className}`}
    >
      <span
        className="group/ih inline-flex items-center gap-1 cursor-help"
        aria-describedby={id}
      >
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
    translate-y-[1px]  /* nudge down to optical center */
  "
>
  ?
</span>


        {/* Tooltip BELOW the icon */}
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



export default function GasCalc() {
const [form, setForm] = useState({
  ship: "Prospect",
  moduleType: "Syndicate Gas Cloud Scoop",
  moduleCount: 2,
  shipCount: 1,
  skills: { Frigate: 5, Barge: 0, Exhumer: 0 },
  implant: 0,
  boostShip: "None",
  miningDirector: 0,
  industrialCommand: 0,
  boostImplant: "none",
  boostModule: "T1",
  bastion: "no"
});

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<keyof ResultRow>("iskPerHour");
  const [sortAsc, setSortAsc] = useState(false);


const handleChange = (e) => {
  const { name, value } = e.target;

  if (["Frigate", "Barge", "Exhumer"].includes(name)) {
    setForm((prev) => ({
      ...prev,
      skills: { ...prev.skills, [name]: +value }
    }));
  } else if (["implant"].includes(name)) {
    setForm((prev) => ({ ...prev, [name]: +value }));
  } else if (["boostShip", "boostModule", "boostImplant", "bastion"].includes(name)) {
    setForm((prev) => ({ ...prev, [name]: value }));
  } else {
    setForm((prev) => ({
      ...prev,
      [name]: name.includes("Count") ? +value : value
    }));
  }
};

const [collapsed, setCollapsed] = useState({
  fleet: false,
  skills: false,
  boosts: false,
});

const toggleSection = (section: keyof typeof collapsed) => {
  setCollapsed((prev) => ({
    ...prev,
    [section]: !prev[section],
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { data } = await axios.post("/api/gas-calc", form, {
      headers: { "Content-Type": "application/json" }
    });
    setResults(data);
  } catch (err) {
    console.error("❌ API call failed:", err?.response?.data || err.message);
    alert("Calculation failed. Check console for details.");
  } finally {
    setLoading(false);
  }
};

const scoops = {
  "Gas Cloud Scoop I": {},
  "Crop' Gas Cloud Scoop": {},
  "Plow' Gas Cloud Scoop": {},
  "Gas Cloud Scoop II": {},
  "Syndicate Gas Cloud Scoop": {}
};

const harvesters = {
  "Gas Cloud Harvester I": {},
  "Gas Cloud Harvester II": {},
  "ORE Gas Cloud Harvester": {}
};

const isFrigate = ["Unbonused Ship", "Venture", "Prospect"].includes(form.ship);
const isBarge = ["Covetor", "Retriever", "Procurer", "Hulk", "Skiff", "Mackinaw"].includes(form.ship);
const modules = Object.keys(isFrigate ? scoops : isBarge ? harvesters : {});

function handleSort(key: string) {
  if (key === sortKey) {
    setSortAsc(!sortAsc); // toggle direction
  } else {
    setSortKey(key);
    setSortAsc(true); // new column, default to ascending
  }
}

const getSortedGroupedResults = () => {
  const grouped: ResultRow[][] = [];

  for (let i = 0; i < results.length; i += 2) {
    grouped.push([results[i], results[i + 1]]);
  }

grouped.sort((a, b) => {
  let valA = a[0][sortKey];
  let valB = b[0][sortKey];

  // Special handling for TTK
  if (sortKey === "ttk") {
    const parseTTK = (ttk: string) => {
      if (!ttk) return Infinity;
      const match = /(?:(\d+)h)?\s*(\d+)m/.exec(ttk);
      if (!match) return Infinity;
      const hours = parseInt(match[1] || "0", 10);
      const minutes = parseInt(match[2], 10);
      return hours * 60 + minutes;
    };
    valA = parseTTK(a[0].ttk ?? a[0].minutesToHuff);
    valB = parseTTK(b[0].ttk ?? b[0].minutesToHuff);
  }

  if (typeof valA === "number" && typeof valB === "number") {
    return sortAsc ? valA - valB : valB - valA;
  }

  if (typeof valA === "string" && typeof valB === "string") {
    return sortAsc
      ? valA.localeCompare(valB, undefined, { numeric: true })
      : valB.localeCompare(valA, undefined, { numeric: true });
  }

  return 0;
});


  return grouped;
};


  return (
    <div className="font-mono">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded shadow-md text-sm text-gray-300">
          <p className="mb-1">
            <span className="font-semibold text-white">Customize your setup</span> using the dropdowns below to match your ship, modules, skills, and implants.
          </p>
          <p className="mb-1">
            You can <span className="font-semibold text-white">sort the return</span> from the calculator by any of the columns, defaults to ISK/hr descending.
          </p>
          <p>
            <span className="font-semibold text-white">Market pricing</span> updates every hour courtesy of{" "}
            <a
              href="https://market.fuzzwork.co.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400 hover:text-blue-300"
            >
              fuzzwork.co.uk
            </a>.
          </p>
        </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Fleet Section */}
        <fieldset className="bg-[rgba(20,25,40,0.75)] shadow-md border border-gray-750 rounded">
          <legend
            onClick={() => toggleSection("fleet")}
            className="text-lg font-semibold text-gray-300 px-4 py-2 cursor-pointer flex justify-between items-center select-none bg-gray-800 border-b border-gray-600"
          >
            Fleet 
            <span className="text-sm text-gray-400">
              {collapsed.fleet ? " ▼" : " ▲"}
            </span>
          </legend>
          <div
            className={`grid transition-all duration-300 ease-in-out overflow-hidden ${collapsed.fleet ? "max-h-0 p-0" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 max-h-[1000px]"}`}
          >
            {["ship", "moduleType", "moduleCount", "shipCount"].map((field) => (
              <div className="flex flex-col" key={field}>
                <label htmlFor={field} className="mb-1 text-sm capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                {field.includes("Count") ? (
                  <input
                    id={field}
                    name={field}
                    type="number"
                    value={form[field]}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-full min-w-[180px]"
                  />
                ) : (
                  <select
                    id={field}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    {(field === "ship" ? ships : modules).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </fieldset>

        {/* Skills Section */}
        <fieldset className="bg-[rgba(20,25,40,0.75)] shadow-md border border-gray-750 rounded">
          <legend
            onClick={() => toggleSection("skills")}
            className="text-lg font-semibold text-gray-300 px-4 py-2 cursor-pointer flex justify-between items-center select-none bg-gray-800 border-b border-gray-600"
          >
            Skills 
            <span className="text-sm text-gray-400">
              {collapsed.skills ? " ▼" : " ▲"}
            </span>
          </legend>
          <div
            className={`grid transition-all duration-300 ease-in-out overflow-hidden ${collapsed.skills ? "max-h-0 p-0" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 max-h-[1000px]"}`}
          >
            {["Frigate", "Barge", "Exhumer"].map((skill) => (
              <div className="flex flex-col" key={skill}>
                <label htmlFor={skill} className="mb-1 text-sm">
                  {skill} Level
                </label>
                <input
                  id={skill}
                  name={skill}
                  type="number"
                  min="0"
                  max="5"
                  value={form.skills[skill]}
                  onChange={handleChange}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-full min-w-[180px]"
                />
              </div>
            ))}
            <div className="flex flex-col">
              <label htmlFor="implant" className="mb-1 text-sm">
                Implant Used
              </label>
              <select
                id="implant"
                name="implant"
                value={form.implant}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {implants.map((imp) => (
                  <option key={imp.label} value={imp.value}>
                    {imp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Boosts Section */}
        <fieldset className="bg-[rgba(20,25,40,0.75)] shadow-md border border-gray-750 rounded">
          <legend
            onClick={() => toggleSection("boosts")}
            className="text-lg font-semibold text-gray-300 px-4 py-2 cursor-pointer flex justify-between items-center select-none bg-gray-800 border-b border-gray-600"
          >
            Boosts 
            <span className="text-sm text-gray-400">
              {collapsed.boosts ? " ▼" : " ▲"}
            </span>
          </legend>
          <div
            className={`grid transition-all duration-300 ease-in-out overflow-hidden ${collapsed.boosts ? "max-h-0 p-0" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-h-[1000px]"}`}
          >
            <div className="flex flex-col">
              <label htmlFor="boostShip" className="mb-1 text-sm">
                Boost Ship
              </label>
              <select
                id="boostShip"
                name="boostShip"
                value={form.boostShip}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {boostShips.map((ship) => (
                  <option key={ship} value={ship}>
                    {ship}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="miningDirector" className="mb-1 text-sm">
                Mining Director Level
              </label>
              <input
                id="miningDirector"
                name="miningDirector"
                type="number"
                min="0"
                max="5"
                value={form.miningDirector}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-full min-w-[180px]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="industrialCommand" className="mb-1 text-sm">
                Industrial Command Ships Level
              </label>
              <input
                id="industrialCommand"
                name="industrialCommand"
                type="number"
                min="0"
                max="5"
                value={form.industrialCommand}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-full min-w-[180px]"
              />
            </div>
            <div className="flex flex-col">
  <label
    htmlFor="boostImplant"
    className="mb-1 text-sm flex items-center gap-1"
  >
    Boost Implant
    {/* tooltip */}
    <span className="relative group cursor-help select-none">
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
          group-hover:bg-blue-500/30 group-hover:text-blue-100
          group-focus-within:bg-blue-500/30 group-focus-within:text-blue-100
          transition-colors duration-150
          translate-y-[1px]
        "
      >
        ?
      </span>
      <span
        role="tooltip"
        className="
          absolute left-1/2 -translate-x-1/2 bottom-full mb-1 z-50 hidden
          group-hover:block group-focus-within:block
          w-48 sm:w-56 max-w-xs px-2 py-1 rounded border border-gray-700 shadow-lg
          bg-gray-900 text-[11px] leading-snug text-gray-100
          whitespace-normal break-words pointer-events-none
        "
      >
        Mining Foreman Mindlink and ORE Mining Director give the same mining
        burst bonus. ORE also adds shield boosts (ignored here).
      </span>
    </span>
  </label>

  <select
    id="boostImplant"
    name="boostImplant"
    value={form.boostImplant}
    onChange={handleChange}
    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
  >
    <option value="none">No</option>
    <option value="mindlink">Yes</option>
  </select>
</div>

            <div className="flex flex-col">
              <label htmlFor="boostModule" className="mb-1 text-sm">
                Boost Module
              </label>
              <select
                id="boostModule"
                name="boostModule"
                value={form.boostModule}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {boostModules.map((mod) => (
                  <option key={mod.label} value={mod.value}>
                    {mod.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="bastion" className="mb-1 text-sm">
                Industrial Core
              </label>
              <select
                id="bastion"
                name="bastion"
                value={form.bastion}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {["No", "Yes"].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-6 text-center transition-colors duration-200"
        >
          Calculate
        </button>
      </form>
      <div className="mb-6" />

        {/* Table */}
        {results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm border border-gray-700">
<thead className="bg-gray-900 text-white">
  <tr>
    <th className="border px-3 py-2">Site</th>
    <th className="border px-3 py-2">Gas</th>

    <th
      className="border px-3 py-2 cursor-pointer hover:text-cyan-300"
      onClick={() => handleSort("m3PerCloud")}
    >
      M³/Cloud {sortKey === "m3PerCloud" && (sortAsc ? "▲" : "▼")}
    </th>

    <InfoHead
      id="m3lost"
      tip="Expected m³ destroyed by residue (waste) instead of harvested. Based on module residue % × multiplier."
    >
      <span
        className="cursor-pointer hover:text-cyan-300"
        onClick={() => handleSort("m3LostResidue")}
      >
        M³ Lost {sortKey === "m3LostResidue" && (sortAsc ? "▲" : "▼")}
      </span>
    </InfoHead>

    <th
      className="border px-3 py-2 cursor-pointer hover:text-cyan-300"
      onClick={() => handleSort("iskPerCloud")}
    >
      ISK/Cloud {sortKey === "iskPerCloud" && (sortAsc ? "▲" : "▼")}
    </th>

    <InfoHead
      id="isklost"
      tip="ISK value of expected residue (waste) destroyed instead of harvested."
    >
      <span
        className="cursor-pointer hover:text-cyan-300"
        onClick={() => handleSort("iskLostResidue")}
      >
        ISK Lost {sortKey === "iskLostResidue" && (sortAsc ? "▲" : "▼")}
      </span>
    </InfoHead>

    <th
      className="border px-3 py-2 cursor-pointer hover:text-cyan-300"
      onClick={() => handleSort("ttk")}
    >
      TTK {sortKey === "ttk" && (sortAsc ? "▲" : "▼")}
    </th>

    <th
      className="border px-3 py-2 cursor-pointer hover:text-cyan-300"
      onClick={() => handleSort("iskPerHour")}
    >
      ISK/hr {sortKey === "iskPerHour" && (sortAsc ? "▲" : "▼")}
    </th>
  </tr>
</thead>

<tbody>
  {(() => {
    const rows = [];
    let rowIndex = 0;

    for (const [r1, r2] of getSortedGroupedResults()) {
      const ttk1 = r1.ttk ?? r1.minutesToHuff;
      const ttk2 = r2.ttk ?? r2.minutesToHuff;

      const siteIskAdj =
        (r1.iskPerCloud ?? 0) +
        (r2?.iskPerCloud ?? 0);

      const bgColor = rowIndex % 2 === 0 ? "bg-gray-800" : "bg-gray-700";

      rows.push(
        <tr key={`${r1.site}-1`} className={bgColor}>
          <td
            className="border px-3 py-2 text-center align-middle"
            rowSpan={2}
          >
            <div className="text-lg font-bold">{r1.site}</div>
            <div className="text-xs text-gray-400 mt-1">
              💰 {Math.round(siteIskAdj / 1_000_000)}M ISK
            </div>
          </td>

          {/* row 1 gas */}
          <td className="border px-3 py-2">{r1.gas}</td>
          <td className="border px-3 py-2">{Math.round(r1.m3PerCloud ?? r1.m3_per_cloud).toLocaleString()}</td>
          <td className="border px-3 py-2 text-red-300">
            {Math.round(r1.m3LostResidue ?? 0).toLocaleString()}
          </td>
          <td className="border px-3 py-2">
            {(r1.iskPerCloud ?? r1.totalIskPerCloud).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </td>
          <td className="border px-3 py-2 text-red-300">
            {(r1.iskLostResidue ?? 0).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </td>
          <td className="border px-3 py-2 font-mono">{ttk1}</td>
          <td className="border px-3 py-2">
            {r1.iskPerHour.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </td>
        </tr>,
        <tr key={`${r1.site}-2`} className={bgColor}>
          {/* row 2 gas */}
          <td className="border px-3 py-2">{r2.gas}</td>
          <td className="border px-3 py-2">{Math.round(r2.m3PerCloud ?? r2.m3_per_cloud).toLocaleString()}</td>
          <td className="border px-3 py-2 text-red-300">
            {Math.round(r2.m3LostResidue ?? 0).toLocaleString()}
          </td>
          <td className="border px-3 py-2">
            {(r2.iskPerCloud ?? r2.totalIskPerCloud).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </td>
          <td className="border px-3 py-2 text-red-300">
            {(r2.iskLostResidue ?? 0).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </td>
          <td className="border px-3 py-2 font-mono">{ttk2}</td>
          <td className="border px-3 py-2">
            {r2.iskPerHour.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </td>
        </tr>
      );

      rowIndex++;
    }

    return rows;
  })()}
</tbody>

            </table>
          </div>
        )}
        {/* Table (unchanged) */}
        {/* ... */}
      </div>
    </div>
  );
}
