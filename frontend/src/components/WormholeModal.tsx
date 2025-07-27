import React, { useEffect, useState } from "react";

export const WormholeModal = ({ system, onClose }) => {
  const [killboardSummary, setKillboardSummary] = useState(null);
  const [zkillActivity, setZkillActivity] = useState(null);

  useEffect(() => {
    const fetchKillboard = async () => {
      if (!system?.solarsystemid) return;
      try {
        const res = await fetch(`/api/killboard-summary/${system.solarsystemid}`);
        const data = await res.json();
        setKillboardSummary(data);
      } catch (err) {
        console.error("Failed to fetch killboard summary:", err);
      }
    };

    const fetchZkillStats = async () => {
      try {
        const res = await fetch(`https://zkillboard.com/api/stats/solarSystemID/${system.solarsystemid}/`);
        const data = await res.json();
        setZkillActivity(data.activity);
      } catch (err) {
        console.error("Failed to fetch zKill activity heatmap:", err);
      }
    };

    fetchKillboard();
    fetchZkillStats();
  }, [system?.solarsystemid]);

  if (!system) return null;

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
  other: "text-white",
};

const getClassColor = (cls: string) => {
  const key = `c${cls}`;
  return classColorMap[key] || classColorMap["other"];
};

const getStaticColor = (code: string) => {
  const map = {
    c1: ["H121", "Z647", "V301", "P060", "Y790", "Q317", "Z971"],
    c2: ["C125", "D382", "O477", "N766", "D364", "G024", "R943"],
    c3: ["O883", "I182", "M267", "N968", "C247", "L477", "X702"],
    c4: ["M609", "Y683", "T405", "X877", "Z457", "O128", "N128"],
    c5: ["L614", "N062", "N770", "H900", "H296", "E175", "V911", "M555", "N432"],
    c6: ["S804", "R474", "A982", "U574", "V753", "C248", "B041", "W237"],
    hs: ["N110", "B274", "D845", "S047", "D792", "B520", "A641", "B449", "Q063"],
    ls: ["J244", "A239", "U210", "N290", "C140", "R051", "N944", "V898"],
    ns: ["Z060", "E545", "K346", "K329", "Z142", "V283", "S199", "U319", "E587"]
  };
  for (const [cls, codes] of Object.entries(map)) {
    if (codes.includes(code)) return classColorMap[cls] || classColorMap["other"];
  }
  return classColorMap["other"];
};

  const getStaticDisplay = (code) => {
    const classMap = {
      c1: ["H121", "Z647", "V301", "P060", "Y790", "Q317", "Z971"],
      c2: ["C125", "D382", "O477", "N766", "D364", "G024", "R943"],
      c3: ["O883", "I182", "M267", "N968", "C247", "L477", "X702"],
      c4: ["M609", "Y683", "T405", "X877", "Z457", "O128", "N128"],
      c5: ["L614", "N062", "N770", "H900", "H296", "E175", "V911", "M555", "N432"],
      c6: ["S804", "R474", "A982", "U574", "V753", "C248", "B041", "W237"],
      hs: ["N110", "B274", "D845", "S047", "D792", "B520", "A641", "B449", "Q063"],
      ls: ["J244", "A239", "U210", "N290", "C140", "R051", "N944", "V898"],
      ns: ["Z060", "E545", "K346", "K329", "Z142", "V283", "S199", "U319", "E587"]
    };
    for (const [cls, codes] of Object.entries(classMap)) {
      if (codes.includes(code)) return `${code} - ${cls.toUpperCase()}`;
    }
    return `${code} - OTHER`;
  };

  const topEntities = (entities) => {
    return [...entities]
      .sort((a, b) => {
        if (b.activeDays !== a.activeDays) return b.activeDays - a.activeDays;
        return a.lastSeenDaysAgo - b.lastSeenDaysAgo;
      })
      .slice(0, 10);
  };

  const renderHeatmap = () => {
    if (!zkillActivity || !zkillActivity.days) return <div className="text-gray-400 text-sm">Loading activity...</div>;
    const days = zkillActivity.days;
    return (
      <table className="w-full text-xs text-center text-gray-300">
        <thead>
          <tr>
            <th className="text-left pr-2">Day/Hour</th>
            {[...Array(24).keys()].map((h) => (
              <th key={h} className="font-mono text-[10px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dIdx) => (
            <tr key={dIdx}>
              <td className="text-left pr-2">{day}</td>
{[...Array(24).keys()].map((h) => {
  const count = zkillActivity[dIdx]?.[h] || 0;
  const max = zkillActivity.max || 1;
  const intensity = Math.min(255, Math.floor((count / max) * 255));

const red = count === 0
  ? 60  // gray fallback for 0 activity
  : 100 + Math.floor((count / max) * 155); // 100–255 red scaling

const cellColor = count === 0
  ? "rgb(60, 60, 60)" // gray for 0 kills
  : `rgb(${red}, 0, 0)`; // red gradient for activity


  return (
    <td
      key={h}
      style={{
        backgroundColor: cellColor,
        width: "20px",
        height: "20px",
      }}
      className="border border-gray-800"
    ></td>
  );
})}



            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
  <div
    className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center"
    onClick={onClose} // click outside will close
  >
      <div className="relative z-50 max-w-4xl w-full mx-auto bg-black border border-cyan-500 rounded-xl p-8 h-[90vh] overflow-y-auto" 
      onClick={(e) => e.stopPropagation()} >
        <div className="flex items-start gap-4 mb-6 relative">
  <div className="flex flex-col">
    <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
      <div className="text-4xl font-bold font-mono">{system.jcode}</div>
      <span className="text-sm text-gray-400">{system.region}</span>
      <span className="text-sm text-gray-400">{system.constellation}</span>
      <span className="text-sm text-gray-400">{system.solarsystemid}</span>
    </div>
  </div>

  {/* Right: External Links */}
   <div className="ml-auto pr-16 flex flex-wrap gap-2 text-xs text-blue-400 pt-5">
    <a
      href={`https://evemaps.dotlan.net/system/${system.jcode}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      Dotlan
    </a>
    <a
      href={`https://www.ellatha.com/eve/WormholeSystemview.asp?key=${system.jcode.replace("J", "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      Ellatha
    </a>
    <a
      href={`https://zkillboard.com/system/${system.solarsystemid}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      zKillboard
    </a>
    <a
      href={`https://anoik.is/systems/${system.jcode}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      Anoik.is
    </a>
  </div>

  {/* Close button */}
  <button
    onClick={onClose}
    className="absolute top-3 right-3 text-white text-lg hover:text-red-400"
  >
    ×
  </button>
</div>

        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
          <div className={`px-2 py-1 border rounded bg-gray-800 font-mono ${getClassColor(system.class)}`}>
  Class: {system.class}
</div>

          {system.effect && (
            <div className="px-2 py-1 border rounded bg-gray-800">Weather: {system.effect}</div>
          )}
{system.statics?.map((s) => (
  <div key={s} className={`px-2 py-1 border rounded bg-gray-800 font-mono ${getStaticColor(s)}`}>
    {getStaticDisplay(s)}
  </div>
))}

        </div>

        <div className="grid grid-cols-[480px_1fr] gap-12">
          <div className="space-y-3">
            <div className="border border-gray-700 rounded-md p-2 bg-gray-900">
              <div className="text-sm font-bold text-white mb-1">Killboard activity calendar</div>
              {renderHeatmap()}
            </div>

            <div className="border border-gray-700 rounded-md p-3 bg-gray-900">
              <div className="font-bold text-sm text-white">Kills / Recent Kill</div>
              <div className="text-xs text-gray-400">
                {killboardSummary ? `${killboardSummary.totalKills} kills in last ${killboardSummary.daysCovered} days, the last one was ${killboardSummary.mostRecentKillDaysAgo} days ago` : "Loading..."}
              </div>
            </div>

            <div className="border border-gray-700 rounded-md p-3 bg-gray-900 text-sm text-gray-300">
              <div className="font-bold text-white mb-1">Recent corps</div>
              {killboardSummary ? (
                <ul className="text-xs space-y-1">
                  {topEntities(killboardSummary.activeCorporations).map((corp) => (
                    <li key={corp.id}>
                      <a
                        href={`https://zkillboard.com/corporation/${corp.id}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {corp.name}
                      </a>{" "}
                      (Active {corp.activeDays}d, last seen {corp.lastSeenDaysAgo}d ago)
                    </li>
                  ))}
                </ul>
              ) : (
                "Loading..."
              )}
            </div>
          </div>

          <div>
            <div className="text-lg font-semibold mb-2">Celestials</div>
            <div className="flex flex-col gap-2">
              {system.star_type_id && (
                <div className="flex items-center gap-2">
                  <img src={`https://image.eveonline.com/Type/${system.star_type_id}_32.png`} alt="star" className="w-6 h-6" />
                  <span>{system.star_name || "Unknown Star"}</span>
                </div>
              )}
{system.planets.map((planet, i) => (
  <div key={planet.planet_id} className="flex items-center gap-2 text-sm">
    <img
      src={`https://image.eveonline.com/Type/${planet.type_id}_32.png`}
      alt={planet.type_name}
      className="w-4 h-4"
    />
    <span className="text-gray-200">
      {planet.name} —{" "}
      <span className="text-gray-400">{planet.type_name.replace("Planet ", "")}</span>
      {" — "}
      <span className={planet.moon_count === 0 ? "text-gray-600" : "text-gray-300"}>
        {planet.moon_count} moon{planet.moon_count !== 1 ? "s" : ""}
      </span>
    </span>
  </div>
))}
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};