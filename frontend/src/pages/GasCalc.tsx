import { useState } from "react";
import axios from "axios";

const ships = [
  "Unbonused Ship", "Venture", "Prospect", "Covetor", "Retriever", "Procurer", "Hulk", "Skiff", "Mackinaw"
];

const modules = Object.keys({
  "Gas Cloud Scoop I": {},
  "Crop' Gas Cloud Scoop": {},
  "Plow' Gas Cloud Scoop": {},
  "Gas Cloud Scoop II": {},
  "Syndicate Gas Cloud Scoop": {},
  "Gas Cloud Harvester I": {},
  "Gas Cloud Harvester II": {},
  "ORE Gas Cloud Harvester": {}
});

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
    console.log("🚀 Results from backend:", data);
    setResults(data);
  } catch (err) {
    console.error("❌ API call failed:", err?.response?.data || err.message);
    alert("Calculation failed. Check console for details.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative min-h-screen bg-[#1e1f29] text-gray-100 font-mono overflow-hidden">
      <div className="absolute inset-0 z-0 animate-starfield pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400/20 to-transparent z-10" />
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-blue-400/20 to-transparent z-10" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded shadow-md text-sm text-gray-300">
          <p className="mb-1">
            ⚙️ <span className="font-semibold text-white">Customize your setup</span> using the dropdowns below to match your ship, modules, skills, and implants.
          </p>
          <p>
            📈 <span className="font-semibold text-white">Market pricing</span> updates every hour courtesy of{" "}
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
              <label htmlFor="boostImplant" className="mb-1 text-sm">
                Boost Implant
              </label>
              <select
                id="boostImplant"
                name="boostImplant"
                value={form.boostImplant}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {boostImplants.map((imp) => (
                  <option key={imp.label} value={imp.value}>
                    {imp.label}
                  </option>
                ))}
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
                Bastion
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
                  <th className="border px-3 py-2">ISK/unit</th>
                  <th className="border px-3 py-2">m³/unit</th>
                  <th className="border px-3 py-2">m³/cloud</th>
                  <th className="border px-3 py-2">TTK</th>
                  <th className="border px-3 py-2">ISK/hr</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                    const rows = [];
                    for (let i = 0; i < results.length; i += 2) {
                        const r1 = results[i];
                        const r2 = results[i + 1];

                        rows.push(
                            <tr key={i} className={Math.floor(i / 2) % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                                <td
  className="border px-3 py-2 text-center align-middle"
  rowSpan={2}
>
  <div className="text-lg font-bold">{r1.site}</div>
  <div className="text-xs text-gray-400 mt-1">
  💰 {Math.round((r1.totalIskPerCloud + r2.totalIskPerCloud) / 1_000_000)}M ISK
</div>
</td>
          <td className="border px-3 py-2">{r1.gas}</td>
          <td className="border px-3 py-2">{r1.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
          <td className="border px-3 py-2">{r1.m3_per_unit}</td>
          <td className="border px-3 py-2">{r1.m3_per_cloud.toLocaleString()}</td>
          <td className="border px-3 py-2 font-mono">{r1.minutesToHuff}</td>
          <td className="border px-3 py-2">{r1.iskPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
        </tr>,
        <tr key={i + 1} className={Math.floor(i / 2) % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
          <td className="border px-3 py-2">{r2.gas}</td>
          <td className="border px-3 py-2">{r2.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
          <td className="border px-3 py-2">{r2.m3_per_unit}</td>
          <td className="border px-3 py-2">{r2.m3_per_cloud.toLocaleString()}</td>
          <td className="border px-3 py-2 font-mono">{r2.minutesToHuff}</td>
          <td className="border px-3 py-2">{r2.iskPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
        </tr>
      );
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
