export const shipNameToClassMap: Record<string, "frigate" | "cruiser" | "battleship" | "sentry" | "tower"> = {
  // Towers
  "Vigilant Sentry Tower": "tower",
  "Wakeful Sentry Tower": "tower",
  "Restless Sentry Tower": "tower",

  // Frigates
  "Emergent Escort": "frigate",
  "Emergent Patroller": "frigate",
  "Emergent Watchman": "frigate",
  "Emergent Defender": "frigate",
  "Emergent Keeper": "frigate",
  "Emergent Preserver": "frigate",
  "Emergent Warden": "frigate",
  "Emergent Upholder": "frigate",

  // Cruisers
  "Awakened Patroller": "cruiser",
  "Awakened Watchman": "cruiser",
  "Awakened Escort": "cruiser",
  "Awakened Defender": "cruiser",
  "Awakened Keeper": "cruiser",
  "Awakened Preserver": "cruiser",
  "Awakened Warden": "cruiser",
  "Awakened Sentinel": "cruiser",
  "Awakened Upholder": "cruiser",

  // Battleships
  "Sleepless Patroller": "battleship",
  "Sleepless Watchman": "battleship",
  "Sleepless Escort": "battleship",
  "Sleepless Defender": "battleship",
  "Sleepless Keeper": "battleship",
  "Sleepless Preserver": "battleship",
  "Sleepless Upholder": "battleship",
  "Sleepless Safeguard": "battleship",
  "Sleepless Sentinel": "battleship",
  "Sleepless Warden": "battleship",
  "Sleepless Guardian": "battleship",
  "Sleepless Outguard": "battleship",

  // Sentinels
  "Emergent Sentinel": "frigate",
};


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

const shipClassIconMap: Record<string, string> = {
  'battleship': '/icons/ships/battleship.png',
  'cruiser': '/icons/ships/cruiser.png',
  'frigate': '/icons/ships/frigate.png',
  'tower': '/icons/ships/sentry.png',
};


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
  trigger: string;
}

function summarizeSpecials(ships: Ship[]): Record<string, number> {
  const totalSpecials: Record<string, number> = {};

  ships.forEach((ship) => {
    if (!ship.special) return;

    for (const [effect, count] of Object.entries(ship.special)) {
      totalSpecials[effect] = (totalSpecials[effect] || 0) + count * ship.qty;
    }
  });

  return totalSpecials;
}
export function getWaveTotals(ships: Ship[]) {
  return {
    totalEHP: ships.reduce((sum, s) => sum + s.ehp * s.qty, 0),
    totalDPS: ships.reduce((sum, s) => sum + s.dps * s.qty, 0),
    totalAlpha: ships.reduce((sum, s) => sum + s.alpha * s.qty, 0),
    totalSpecials: summarizeSpecials(ships),
  };
}


export default function WaveTable({ ships }: { ships: Ship[] }) {
  return (
    <div className="overflow-x-auto border border-gray-700 rounded">
     <table className="table-auto w-full text-sm border border-gray-700">
  <thead className="bg-gray-900 text-white">
  <tr className="text-left text-m bg-black/40 border-b border-gray-700">
    <th className="w-12 p-2">Qty</th>
    <th className="w-60 p-2">Name</th>
    <th className="w-24 p-2">EHP</th>
    <th className="w-20 p-2">DPS</th>
    <th className="w-20 p-2">Alpha</th>
    <th className="w-20 p-2">Sig</th>
    <th className="w-20 p-2">Orbit</th>
    <th className="w-20 p-2">Dist</th>
    <th className="w-44 p-2">Special</th>
  </tr>
</thead>

        <tbody>
          
          {/* Individual ship rows */}
          {ships.map((ship, i) => (
  <tr
    key={i}
    className={`border-b border-gray-800 ${
      i % 2 === 0 ? "bg-gray-900/60" : "bg-black/40"
    }`}
  >

              <td className="w-12 p-2">{ship.qty}</td>
              <td className="ship-name-cell flex items-center gap-2 w-66 p-2">
  {(() => {
    const classType = shipNameToClassMap[ship.name];
    return (
      <>
        {classType && shipClassIconMap[classType] && (
          <img
            src={shipClassIconMap[classType]}
            alt={classType}
            className="w-4 h-4"
            title={classType}
          />
        )}
        <span>{ship.name}</span>
        {/* Trigger badge */}
        {ship.trigger && (
          <span className="ml-1 text-xs bg-red-600 text-white px-1 rounded">Trigger</span>
        )}

        {/* Optional badge */}
        {ship.optional && (
          <span className="ml-1 text-xs bg-green-600 text-white px-1 rounded">Optional</span>
        )}

        {/* DTA badge */}
        {ship.dta && (
          <span className="ml-1 text-xs bg-purple-600 text-white px-1 rounded">DTA</span>
        )}
      </>
    );
  })()}
</td>

              <td className="w-24 p-2">{(ship.ehp * ship.qty).toLocaleString()}</td>
              <td className="w-20 p-2">{(ship.dps * ship.qty).toLocaleString()}</td>
              <td className="w-20 p-2">{(ship.alpha * ship.qty).toLocaleString()}</td>
              <td className="w-20 p-2">{ship.sig}</td>
              <td className="w-20 p-2">{ship.orbit_velocity}</td>
              <td className="w-20 p-2">{ship.distance}</td>
              <td className="flex gap-2 items-center flex-wrap w-44 p-2">
  {ship.special &&
  Object.entries(ship.special)
    .sort(([a], [b]) => (specialSortOrder[a.toLowerCase()] || 99) - (specialSortOrder[b.toLowerCase()] || 99))
    .map(([effect, count], i) => {
      const icon = specialEffectIconMap[effect.toLowerCase()];
      return (
        <div key={i} className="flex items-center gap-1">
          {icon && <img src={icon} alt={effect} className="w-4 h-4" />}
          <span className="text-sm">{`x${count}`}</span>
        </div>
      );
    })}
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
