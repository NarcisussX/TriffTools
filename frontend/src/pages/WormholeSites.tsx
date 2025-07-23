import { useEffect, useState } from "react";
import SiteCard from "../components/SiteCard";

interface Ship {
  qty: number;
  name: string;
  dps: number;
  alpha: number;
  ehp: number;
  sig: number;
  orbit_velocity: number;
  distance: number;
  special: Record<string, number>;
}

interface Wave {
  wave: string;
  ships: Ship[];
}

interface Site {
  site: string;
  type: "Combat" | "Data" | "Relic";
  blue_loot_isk?: number;
  waves: Wave[];
  class: string; // C1–C6 added at load time
}

const classKeys = ["C1", "C2", "C3", "C4", "C5", "C6"];
const types = ["Combat", "Data", "Relic"];
const fileMap = [
  { path: "c1_combat_sites_clean.json", class: "C1", type: "Combat" },
  { path: "c1_datarelic_sites_clean.json", class: "C1", type: "Mixed" },
  { path: "c2_combat_sites_clean.json", class: "C2", type: "Combat" },
  { path: "c2_datarelic_sites_clean.json", class: "C2", type: "Mixed" },
  { path: "c3_combat_sites_clean.json", class: "C3", type: "Combat" },
  { path: "c3_datarelic_sites_clean.json", class: "C3", type: "Mixed" },
  { path: "c4_combat_sites_clean.json", class: "C4", type: "Combat" },
  { path: "c4_datarelic_sites_clean.json", class: "C4", type: "Mixed" },
  { path: "c5_combat_sites_clean.json", class: "C5", type: "Combat" },
  { path: "c5_datarelic_sites_clean.json", class: "C5", type: "Mixed" },
  { path: "c6_combat_sites_clean.json", class: "C6", type: "Combat" },
  { path: "c6_datarelic_sites_clean.json", class: "C6", type: "Mixed" },
];

const avengerWaveC5 = {
  wave: "Upgraded Avengers",
  ships: [
    {
      qty: 3,
      name: "Upgraded Avenger",
      dps: 1210,
      alpha: 0,
      ehp: 1400000,
      sig: 30000,
      orbit_velocity: "300 m/s",
      distance: "20km",
      special: { Scram: 15, Neut: 75, Web: 1, },
    },
  ],
};

const avengerWaveC6 = {
  wave: "Upgraded Avengers",
  ships: [
    {
      qty: 4,
      name: "Upgraded Avenger",
      dps: 1210,
      alpha: 0,
      ehp: 1400000,
      sig: 30000,
      orbit_velocity: "300 m/s",
      distance: "20km",
      special: { Scram: 15, Neut: 75, Web: 1, },
    },
  ],
};


export default function WormholeSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("C5");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showMiniDrifter, setShowMiniDrifter] = useState(false);
  const [showBigDrifter, setShowBigDrifter] = useState(false);



  useEffect(() => {
    const fetchData = async () => {
      const all: Site[] = [];

      for (const entry of fileMap) {
        try {
          const res = await fetch(`/api/data/${entry.path}`);
          const json = await res.json();
          const typed = json.map((s: Site) => ({
            ...s,
            class: entry.class,
            type: s.type || (entry.type === "Mixed" ? "Data" : "Combat"),
          }));
          all.push(...typed);
        } catch (err) {
          console.error(`Failed to load ${entry.path}`, err);
        }
      }

      setSites(all);
    };

    fetchData();
  }, []);

  const filtered = sites.filter((s) => {
    const matchesClass = !classFilter || s.class === classFilter;
    const matchesType = !typeFilter || s.type === typeFilter;
    const matchesSearch = s.site.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesType && matchesSearch;
  });

return (
    <div className="font-mono">
    <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
    <h1 className="text-3xl font-bold mb-4">Wormhole Sites</h1>

    <div className="flex flex-wrap gap-2 mb-4 items-center">
      {/* Class Buttons */}
      <div className="flex gap-2 flex-wrap">
        {classKeys.map((c) => (
          <button
            key={c}
            onClick={() => setClassFilter((prev) => (prev === c ? null : c))}
            className={`px-3 py-1 rounded border ${
              classFilter === c
                ? "bg-blue-600 border-blue-400 text-white"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Type Dropdown */}
      <select
        className="bg-gray-800 p-2 rounded"
        value={typeFilter ?? ""}
        onChange={(e) => setTypeFilter(e.target.value || null)}
      >
        <option value="">All Types</option>
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Search Input */}
      <input
        type="text"
        className="bg-gray-800 p-2 rounded flex-1"
        placeholder="Search site name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
<div className="grid grid-cols-2 gap-2 mb-6 mt-2 max-w-full">
  <button
    className={`w-full px-4 py-2 rounded-md border text-sm font-medium transition ${
      showMiniDrifter
        ? "bg-cyan-700 text-white border-cyan-500"
        : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-800"
    }`}
    onClick={() => {
      setShowMiniDrifter(!showMiniDrifter);
      if (!showMiniDrifter) setShowBigDrifter(false);
    }}
  >
    Drifter Recon Battleship (Mini Drifter)
  </button>
  <button
    className={`w-full px-4 py-2 rounded-md border text-sm font-medium transition ${
      showBigDrifter
        ? "bg-cyan-700 text-white border-cyan-500"
        : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-800"
    }`}
    onClick={() => {
      setShowBigDrifter(!showBigDrifter);
      if (!showBigDrifter) setShowMiniDrifter(false);
    }}
  >
    Drifter Response Battleship (Big Drifter)
  </button>
</div>


    <div className="space-y-4">
{filtered.map((site, i) => {
  let preWave = [];
  let extraWaves = [];
  let extraLoot = 0;

  if (site.class === "C5" || site.class === "C6") {
    if (showBigDrifter) {
      preWave.push(site.class === "C5" ? avengerWaveC5 : avengerWaveC6);
      extraLoot += site.class === "C5" ? 105000000 : 140000000;
    }
    if (site.type === "Combat") {
      if (showMiniDrifter) {
        extraWaves.push({
          wave: "Drifter Recon Battleship",
          ships: [
            {
              qty: 1,
              name: "Drifter Recon Battleship",
              dps: 1067,
              alpha: 0,
              ehp: 1175000,
              sig: 25000,
              orbit_velocity: "400 m/s",
              distance: "13km",
              special: { Scram: 20, Neut: 100, Web: 1, },
            },
          ],
        });
        extraLoot += 100000000;
      }

      if (showBigDrifter) {
        extraWaves.push({
          wave: "Drifter Response Battleship",
          ships: [
            {
              qty: 1,
              name: "Drifter Response Battleship",
              dps: 1600,
              alpha: 0,
              ehp: 2350000,
              sig: 25000,
              orbit_velocity: "400 m/s",
              distance: "13km",
              special: { Scram: 20, Neut: 200, Web: 1, },
            },
          ],
        });
        extraLoot += 300000000;
      }
    }
  }

  const adjustedSite = {
    ...site,
    waves: [...preWave, ...site.waves, ...extraWaves],
    blue_loot_isk: site.blue_loot_isk
      ? site.blue_loot_isk + extraLoot
      : extraLoot,
  };

  return <SiteCard key={`${site.site}-${i}`} site={adjustedSite} />;
})}
    </div>
  </div>
  </div>
);

}
