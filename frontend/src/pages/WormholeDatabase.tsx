import React, { useEffect, useState } from "react";
import axios from "axios";
import { WormholeModal } from "../components/WormholeModal";


interface Planet {
  planet_id: string;
  jcode: string;
  name: string;
  type_id: number;
  type_name: string;
  moon_count: number;
}

interface WormholeSystem {
  id: number;
  jcode: string;
  region: string;
  constellation: string;
  solarsystemid: string;
  class: string;
  effect: string;
  statics: string[];
  star_id: string | null;
  star_type_id: number | null;
  star_name: string | null;
  planets: Planet[];
}

const classColorMap: Record<string, string> = {
  c1: "text-cyan-400",
  c2: "text-blue-400",
  c3: "text-blue-600",
  c4: "text-yellow-400",
  c5: "text-amber-700",
  c6: "text-orange-700",
  hs: "text-green-400",
  ls: "text-yellow-200",
  ns: "text-red-500",
  other: "text-white"
};

const staticClassToJcodes: Record<string, string[]> = {
  c1: ["H121", "Z647", "V301", "P060", "Y790", "Q317", "Z971"],
  c2: ["C125", "D382", "N766", "D364", "G024", "R943"],
  c3: ["O883", "I182", "M267", "N968", "C247", "L477", "X702", "O477" ],
  c4: ["M609", "Y683", "T405", "X877", "Z457", "O128", "N128"],
  c5: ["L614", "N062", "N770", "H900", "H296", "E175", "V911", "M555", "N432"],
  c6: ["S804", "R474", "A982", "U574", "V753", "C248", "B041", "W237"],
  hs: ["N110", "B274", "D845", "S047", "D792", "B520", "A641", "B449", "Q063"],
  ls: ["J244", "A239", "U210", "N290", "C140", "R051", "N944", "V898"],
  ns: ["Z060", "E545", "K346", "K329", "Z142", "V283", "S199", "U319", "E587"],
  thera: ["F353", "F135", "T458", "M164", "L031"]
};

function mapStaticCodeToClass(code: string): string {
  for (const [cls, codes] of Object.entries(staticClassToJcodes)) {
    if (codes.includes(code)) return cls;
  }
  return "other";
}
const staticExitMap: Record<string, string> = {};
Object.entries(staticClassToJcodes).forEach(([exitClass, codes]) => {
  codes.forEach((code) => (staticExitMap[code] = exitClass));
});

const effectList = [
  "Black Hole",
  "Cataclysmic Variable",
  "Magnetar",
  "Pulsar",
  "Red Giant",
  "Wolf Rayet",
  "No Effect"
];

const classMap = {
  c1: "1",
  c2: "2",
  c3: "3",
  c4: "4",
  c5: "5",
  c6: "6",
  c13: "13",
  sentinel: "Sentinel",
  barbican: "Barbican",
  vidette: "Vidette",
  redoubt: "Redoubt",
  conflux: "Conflux"
};

const staticDisplayOrder = [
  "c1", "c2", "c3", "c4", "c5", "c6", "hs", "ls", "ns", "c13"
];

const getStaticDisplayClass = (jcode: string) =>
  staticExitMap[jcode] || "other";

const sortStatics = (jcodes: string[]) =>
  [...jcodes].sort((a, b) => {
    const aClass = getStaticDisplayClass(a);
    const bClass = getStaticDisplayClass(b);
    const aIdx = staticDisplayOrder.indexOf(aClass);
    const bIdx = staticDisplayOrder.indexOf(bClass);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

const WormholeDatabase = () => {
  const [wormholes, setWormholes] = useState<WormholeSystem[]>([]);
  const [filtered, setFiltered] = useState<WormholeSystem[]>([]);
  const [jcodeSearch, setJcodeSearch] = useState("");
  const [selected, setSelected] = useState<WormholeSystem | null>(null);
  const [filters, setFilters] = useState({

    classes: [] as string[],
    statics: [] as string[],
    planets: [] as string[],
    effects: [] as string[],
    a0: false,
    shattered: "all" as "all" | "only" | "none"
  });

  useEffect(() => {
    axios.get("/api/wormholes").then((res) => {
      setWormholes(res.data);
    });
  }, []);

  useEffect(() => {
    setFiltered(
      wormholes.filter((w) => {
        const matchClass =
          filters.classes.length === 0 ||
          filters.classes.some((c) => classMap[c] === w.class || c === w.class);

        const matchStatics =
          filters.statics.length === 0 ||
          filters.statics.every((required) =>
            w.statics?.some((code) => staticExitMap[code] === required)
          );

        const planetTypes = new Set(
          w.planets?.map((p) =>
            p.type_name?.replace("Planet (", "").replace(")", "")
          )
        );

        const matchPlanets =
          filters.planets.length === 0 ||
          filters.planets.every((p) => planetTypes.has(p));

        const matchEffect =
          filters.effects.length === 0 ||
          filters.effects.some((e) =>
            e === "No Effect" ? !w.effect : w.effect === e
          );

        const matchA0 = !filters.a0 || w.star_type_id === 3801;

        const isShattered =
          w.star_name?.toLowerCase().includes("a0iv") ||
          w.planets?.some((p) =>
            p.type_name?.toLowerCase().includes("shattered")
          );

        const matchShattered =
          filters.shattered === "all" ||
          (filters.shattered === "only" && isShattered) ||
          (filters.shattered === "none" && !isShattered);

        return (
          matchClass &&
          matchStatics &&
          matchPlanets &&
          matchEffect &&
          matchA0 &&
          matchShattered
        );
      })
    );
  }, [filters, wormholes]);

  const toggleFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const values = prev[key] as string[];
      return {
        ...prev,
        [key]: values.includes(value)
          ? values.filter((v) => v !== value)
          : [...values, value]
      };
    });
  };

  return (
    <div className="text-white p-4 max-w-7xl mx-auto">
      <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded shadow-md text-sm text-gray-300">
          <p className="mb-1">
            Yes, this page loads slower than some alternatives, I'm shoving the entire DB into your browser in one load so there's no page change and I can use the pretty pop-up modal. Sue me.
          </p>
        </div>
    <div className="max-w-6xl mx-auto bg-[rgba(20,25,40,0.75)] backdrop-blur-sm border border-gray-700 p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Wormhole Database</h1>
      <div className="space-y-4 mb-6 text-sm">
        <div>
          <span className="mr-2">Class:</span>
          {Object.keys(classMap).map((c) => (
            <button
              key={c}
              onClick={() => toggleFilter("classes", c)}
              className={`border px-2 py-1 mr-1 mb-1 rounded ${
                filters.classes.includes(c) ? "bg-blue-800" : "bg-gray-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div>
          <span className="mr-2">Statics:</span>
          {Object.keys(staticClassToJcodes).map((s) => (
            <button
              key={s}
              onClick={() => toggleFilter("statics", s)}
              className={`border px-2 py-1 mr-1 mb-1 rounded ${
                filters.statics.includes(s) ? "bg-green-800" : "bg-gray-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div>
          <span className="mr-2">Planets:</span>
          {["Barren", "Gas", "Ice", "Lava", "Oceanic", "Plasma", "Storm", "Temperate"].map((p) => (
            <button
              key={p}
              onClick={() => toggleFilter("planets", p)}
              className={`border px-2 py-1 mr-1 mb-1 rounded ${
                filters.planets.includes(p) ? "bg-yellow-800" : "bg-gray-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div>
          <span className="mr-2">Effect:</span>
          {effectList.map((e) => (
            <button
              key={e}
              onClick={() => toggleFilter("effects", e)}
              className={`border px-2 py-1 mr-1 mb-1 rounded ${
                filters.effects.includes(e) ? "bg-purple-800" : "bg-gray-800"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <div>
          <label className="mr-4">
            <input
              type="checkbox"
              checked={filters.a0}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, a0: e.target.checked }))
              }
              className="mr-1"
            />
            Only A0 blue stars
          </label>
          <span className="mr-2">Shattered:</span>
          {(["all", "only", "none"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() =>
                setFilters((prev) => ({ ...prev, shattered: opt }))
              }
              className={`border px-2 py-1 mr-1 rounded ${
                filters.shattered === opt ? "bg-red-800" : "bg-gray-800"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
<div className="flex justify-center mt-6">
  <input
    type="text"
    placeholder="Search J-Code"
    className="px-3 py-1 rounded bg-gray-900 text-white text-sm border border-cyan-400 placeholder-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-64 text-center"
    value={jcodeSearch}
    onChange={(e) => setJcodeSearch(e.target.value)}
  />
</div>
<p className="text-sm text-gray-400 mb-2">
  Showing {filtered.length} of 2603 wormholes
</p>

<div className="mt-8 text-[18px] font-mono">

  <div className="grid grid-cols-[60px_100px_120px_140px] gap-x-6 text-gray-400 font-semibold border-b border-gray-600 pb-1 mb-2">
    <div>Class</div>
    <div className="ml-2">J-Code</div>
    <div>Statics</div>
    <div>Effect</div>
  </div>

{filtered
  .filter((w) => {
    const input = jcodeSearch.toLowerCase().replace(/^j/, "");
    return w.jcode.toLowerCase().replace(/^j/, "").includes(input);
  })
  .sort((a, b) => {
    const order = [
      "1", "2", "3", "4", "5", "6", "13",
      "Sentinel", "Barbican", "Vidette", "Redoubt", "Conflux"
    ];
    const aIdx = order.indexOf(a.class);
    const bIdx = order.indexOf(b.class);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  })
  .map((w) => {
    const classKey = `c${w.class}`.toLowerCase();
    const classColor = classColorMap[classKey] || classColorMap["other"];

    return (
      <div
        key={w.jcode}
        className="grid grid-cols-[60px_100px_120px_140px] gap-x-6 py-0.5 border-b border-white/5"
      >
        <div className={classColor}>
  {["Sentinel", "Vidette", "Barbican", "Conflux", "Redoubt"].includes(w.class)
    ? w.class
    : `c${w.class}`}
</div>
        <div className="text-blue-300 ml-2 cursor-pointer underline"  onClick={() => setSelected(w)}>{w.jcode}</div>
        <div className="flex gap-1 flex-wrap">
          {(sortStatics(w.statics || [])).map((code) => {
            const cls = mapStaticCodeToClass(code);
            const color = classColorMap[cls] || classColorMap["other"];
            return (
              <span key={code} className={`${color}`}>
                {cls}
              </span>
            );
          })}
        </div>
        <div className="text-purple-300">
          {w.effect ? w.effect.toLowerCase().replace("variable", "").trim() : ""}
        </div>
      </div>
    );
  })}

</div>



    </div>
    {selected && (
  <WormholeModal system={selected} onClose={() => setSelected(null)} />
)}

    </div>
  );
};

export default WormholeDatabase;