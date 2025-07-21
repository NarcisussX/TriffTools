import { useState } from "react";
import WaveTable from "./WaveTable";
import { getWaveTotals } from "./WaveTable";

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
const specialEffectIconMap: Record<string, string> = {
  scram: "/icons/specials/scram.png",
  web: "/icons/specials/web.png",
  neut: "/icons/specials/neut.png",
  rr: "/icons/specials/rr.png",
};

const specialSortOrder: Record<string, number> = {
  rr: 1,
  web: 2,
  scram: 3,
  neut: 4,
};
interface Wave {
  wave: string;
  ships: Ship[];
}

interface Site {
  site: string;
  type: "Combat" | "Data" | "Relic";
  class: string;
  blue_loot_isk?: number;
  waves: Wave[];
}
function getPeakStats(waves: Wave[]) {
  let peakDPS = 0;
  let peakNeuts = 0;

  for (const wave of waves) {
    // Skip Drifter-injected waves
    if (
      wave.wave === "Drifter Recon Battleship" ||
      wave.wave === "Drifter Response Battleship"
    ) {
      continue;
    }

    const dps = wave.ships.reduce((sum, s) => sum + s.dps * s.qty, 0);
    peakDPS = Math.max(peakDPS, dps);

    const totalNeuts = wave.ships.reduce((sum, s) => {
      const neutCount = s.special?.Neut || 0;
      return sum + neutCount * s.qty;
    }, 0);

    peakNeuts = Math.max(peakNeuts, totalNeuts);
  }

  return { peakDPS, peakNeuts };
}


export default function SiteCard({ site }: { site: Site }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded border border-gray-700 bg-[rgba(20,25,40,0.75)] shadow-md p-4 space-y-2">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-semibold">{site.site}</h2>
          <p className="text-sm text-gray-400">
            {site.class} &bull; {site.type} Site
          </p>
        </div>
        <button
          className="text-sm px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide Waves" : "Show Waves"}
        </button>
      </div>

{site.blue_loot_isk !== undefined && (() => {
  const { peakDPS, peakNeuts } = getPeakStats(site.waves);
  return (
    <div className="text-sm mb-2 flex flex-wrap items-center justify-between gap-4 text-green-400">
      <div>
        Blue Loot: <span className="font-semibold">{site.blue_loot_isk.toLocaleString()} ISK</span>
      </div>
      <div className="flex gap-4 items-center text-white">
        <div className="px-2 py-1 rounded border border-red-500 bg-red-500/10 text-red-300">
          Peak DPS: <span className="font-semibold">{peakDPS.toLocaleString()}</span>
        </div>
         <div className="px-2 py-1 rounded border border-blue-500 bg-blue-500/10 text-blue-300 flex items-center gap-1">Peak Neut:
          <img src="/icons/specials/neut.png" alt="neut" className="w-4 h-4" />
          <span className="font-semibold">x{peakNeuts}</span>
        </div>
      </div>
    </div>
  );
})()}


      {expanded && (
        <div className="mt-2 space-y-4">
          {site.waves.map((wave, idx) => (
  <div key={idx}>
    {(() => {
  const { totalEHP, totalDPS, totalAlpha, totalSpecials } = getWaveTotals(wave.ships);
  const sortedSpecials = Object.entries(totalSpecials).sort(
    ([a], [b]) => (specialSortOrder[a.toLowerCase()] || 99) - (specialSortOrder[b.toLowerCase()] || 99)
  );

  return (
    <div className="flex justify-between items-center bg-gray-800 px-2 py-1 rounded text-sm mb-1">
      <h3 className="font-bold text-lg text-blue-400">{wave.wave}</h3>
      <div className="flex gap-6 text-gray-300">
        <div>EHP: <span className="text-white">{totalEHP.toLocaleString()}</span></div>
        <div>DPS: <span className="text-white">{totalDPS.toLocaleString()}</span></div>
        <div>Alpha: <span className="text-white">{totalAlpha.toLocaleString()}</span></div>
        <div className="flex items-center gap-2 flex-wrap">
          {sortedSpecials.map(([effect, count], i) => {
            const icon = specialEffectIconMap[effect.toLowerCase()];
            return (
              <div key={i} className="flex items-center gap-1">
                {icon && <img src={icon} alt={effect} className="w-4 h-4" />}
                <span className="text-sm">{`x${count}`}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
})()}


    {wave.triggerOnHack && (
      <div className="text-sm text-yellow-400 font-semibold mb-1">
        ⚠️ Triggered on Hack
      </div>
    )}

    <WaveTable ships={wave.ships} />
  </div>
))}

        </div>
      )}
    </div>
  );
}
