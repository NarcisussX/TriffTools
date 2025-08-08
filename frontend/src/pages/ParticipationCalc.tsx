import React, { useEffect, useState } from "react";

export default function ParticipationCalc() {
  const [siteTier, setSiteTier] = useState("C5");
  const [siteNames, setSiteNames] = useState<string[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [drifterRan, setDrifterRan] = useState(true);
  const [usedDread, setUsedDread] = useState(true);
  const [accounting, setAccounting] = useState(5);
  const [results, setResults] = useState<any[]>([]);
  const [totalISK, setTotalISK] = useState(0);
  const [siteTotals, setSiteTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchSites = async () => {
      const tiers = ["combat", "datarelic"];
      let allSites: string[] = [];

      for (let tier of tiers) {
        const res = await fetch(
          `/api/data/${siteTier.toLowerCase()}_${tier}_sites_clean.json`
        );
        const data = await res.json();
        allSites = [...allSites, ...data.map((s: any) => s.site)];
      }

      setSiteNames(allSites);

      // init Number Ran row
      const initTotals: Record<string, number> = {};
      allSites.forEach((s: string) => (initTotals[s] = 0));
      setSiteTotals(initTotals);

      // normalize existing players to include any new/changed sites
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          participation: allSites.reduce((acc, s) => {
            acc[s] = p.participation?.[s] ?? 0;
            return acc;
          }, {} as Record<string, number>),
        }))
      );
    };

    fetchSites();
  }, [siteTier]);

  const addPlayer = () => {
    if (!playerName.trim()) return;
    const participation: Record<string, number> = {};
    siteNames.forEach((site) => (participation[site] = 0));
    setPlayers([...players, { name: playerName.trim(), participation }]);
    setPlayerName("");
  };

  const updateSiteTotal = (site: string, value: string) => {
    setSiteTotals((prev) => ({ ...prev, [site]: parseInt(value) || 0 }));
  };

  const updateParticipation = (playerIndex: number, site: string, value: string) => {
    const updated = [...players];
    updated[playerIndex].participation[site] = parseInt(value) || 0;
    setPlayers(updated);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { siteTier, players, siteTotals, drifterRan, usedDread, accounting };

    const res = await fetch("/api/participation-calc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("participation POST failed", res.status, await res.text());
      setResults([]);
      return;
    }

    const data = await res.json();
    setResults(data.payouts);
    setTotalISK(data.totalISK);
  };

  // UI helpers
  const displayVal = (n: number | undefined) => (n === 0 || n === undefined ? "" : String(n));
  const isOverLimit = (site: string, count: number) => count > (siteTotals[site] ?? 0);

  return (
    <div className="font-mono mx-auto max-w-6xl p-6">
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded shadow-md text-sm text-gray-300">
          <p className="mb-1">
This tool calculates a participation based ISK split for all wormhole sites based on how many players were present. Input the total number of each site type your group ran and then for each player you add, input the number of sites that player participated in. C5 and C6 sites automatically include Avenger loot if the dread dropdown is set to yes, and for combat sites also includes mini drifter/big drifter logic based on the dread and drifter dropdowns.
          </p>
        </div>
      {/* Controls */}
      <div className="bg-[rgba(20,25,40,0.9)] p-4 rounded-lg border border-gray-700 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm text-white">
            Site Tier:
            <select
              className="ml-2 bg-gray-800 border border-gray-600 text-sm rounded px-2 py-1"
              value={siteTier}
              onChange={(e) => setSiteTier(e.target.value)}
            >
              {["C1", "C2", "C3", "C4", "C5", "C6"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>

          {(siteTier === "C5" || siteTier === "C6") && (
            <>
              <label className="text-sm text-white">
                Drifter ran?
                <select
                  className="ml-2 bg-gray-800 border border-gray-600 text-sm rounded px-2 py-1"
                  value={drifterRan ? "yes" : "no"}
                  onChange={(e) => setDrifterRan(e.target.value === "yes")}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label className="text-sm text-white">
                Dread used?
                <select
                  className="ml-2 bg-gray-800 border border-gray-600 text-sm rounded px-2 py-1"
                  value={usedDread ? "yes" : "no"}
                  onChange={(e) => setUsedDread(e.target.value === "yes")}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
            </>
          )}

          <label className="text-sm text-white">
            Accounting Level:
            <select
              className="ml-2 bg-gray-800 border border-gray-600 text-sm rounded px-2 py-1"
              value={accounting}
              onChange={(e) => setAccounting(parseInt(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Form/Table */}
      <form onSubmit={handleSubmit} className="rounded-lg border-none overflow-hidden">
        {/* transparent container; let inner pieces define their own bgs */}
        <div className="bg-transparent">
          {/* keep page from scrolling horizontally */}
          <div className="max-w-full overflow-hidden">
            <table className="border-separate border-spacing-y-2 w-full text-xs sm:text-sm text-white">
              <thead>
                <tr className="bg-gray-900">
                  <th className="sticky left-0 bg-gray-900 px-3 py-3 text-left w-40 font-semibold">
                    Player
                  </th>
                  {siteNames.map((site) => (
                    <th
                      key={site}
                      className="px-2 py-2 whitespace-normal break-words leading-tight tracking-tight min-w-[6.5rem] max-w-[8rem]"
                      title={site}
                    >
                      <span className="inline-block leading-tight">{site}</span>
                    </th>
                  ))}
                  <th className="px-2 py-3 w-16 text-center">Remove</th>
                </tr>
              </thead>

              <tbody>
                {/* Number Ran “bubble” */}
                <tr>
                  <td colSpan={siteNames.length + 2} className="pt-2 pb-1">
                    <div className="rounded-xl bg-[#233654] ring-1 ring-blue-900/50 px-3 py-2">
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: `9rem repeat(${siteNames.length}, minmax(6.5rem, 1fr)) 3rem`,
                        }}
                      >
                        {/* Left label cell */}
                        <div className="text-right pr-3 font-semibold text-blue-200">
                          Number Ran
                        </div>

                        {/* Site inputs */}
                        {siteNames.map((site) => (
                          <div key={site} className="px-2 py-1">
                            <input
                              type="number"
                              min={0}
                              className="w-10 sm:w-12 bg-gray-800 border border-gray-600 rounded-md text-center text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={displayVal(siteTotals[site])}
                              placeholder="0"
                              onChange={(e) => updateSiteTotal(site, e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                            />
                          </div>
                        ))}

                        {/* trailing dash cell */}
                        <div className="text-center text-gray-400">—</div>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* visual spacer below the bubble */}
                <tr>
                  <td colSpan={siteNames.length + 2} className="h-2" />
                </tr>

                {/* Player rows — zebra striping, opaque “cards” */}
                {players.map((p, i) => {
                  const rowBg =
                    i % 2 === 0
                      ? "bg-[rgba(18,22,34,0.98)] hover:bg-[rgba(24,30,46,0.98)]"
                      : "bg-[rgba(14,18,28,0.98)] hover:bg-[rgba(20,26,40,0.98)]";

                  return (
                    <tr
                      key={i}
                      className={`${rowBg} ring-1 ring-gray-700 rounded-xl shadow-sm transition-colors`}
                    >
                      <td className="sticky left-0 px-3 py-2 rounded-l-xl font-semibold bg-inherit">
                        {p.name}
                      </td>

                      {siteNames.map((site) => {
                        const count = Number(p.participation[site] || 0);
                        const over = isOverLimit(site, count);
                        return (
                          <td key={site} className="px-2 py-2">
                            <input
                              type="number"
                              min={0}
                              className={
                                "w-10 sm:w-12 bg-gray-800 border rounded-md text-center text-xs sm:text-sm focus:outline-none focus:ring-1 " +
                                (over
                                  ? "border-rose-500 focus:ring-rose-500"
                                  : "border-gray-600 focus:ring-blue-500")
                              }
                              value={displayVal(count)}
                              placeholder="0"
                              title={
                                over
                                  ? `Player count (${count}) exceeds Number Ran (${siteTotals[site] ?? 0})`
                                  : ""
                              }
                              onChange={(e) => updateParticipation(i, site, e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                            />
                          </td>
                        );
                      })}

                      <td className="px-2 py-2 text-center rounded-r-xl bg-inherit">
                        <button
                          type="button"
                          onClick={() => removePlayer(i)}
                          className="text-rose-400 hover:text-rose-300"
                          title="Remove player"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add player row */}
          <div className="p-3 flex items-center gap-2 bg-[rgba(22,26,40,0.98)] border-t border-gray-700">
            <input
              type="text"
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm w-64"
              placeholder="Player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPlayer();
                }
              }}
            />
            <button
              type="button"
              onClick={addPlayer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              Add Player
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 text-sm sm:text-base rounded-lg"
        >
          Calculate
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-10 text-white">
          <h2 className="text-xl font-bold mb-2">
            Payout Breakdown — {(totalISK / 1_000_000).toFixed(0)}m ISK
          </h2>
          <p className="text-blue-300 font-semibold mb-2">
            Applied Broker Tax: {(7.5 - 0.462 * accounting).toFixed(2)}%
          </p>

          <table className="table-auto w-full text-sm border border-gray-700 bg-gray-800 text-white">
            <thead className="bg-gray-900">
              <tr>
                <th className="border px-3 py-2">Player</th>
                <th className="border px-3 py-2">ISK Earned</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
                  <td className="border px-3 py-2">{r.name}</td>
                  <td className="border px-3 py-2">{r.payout.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
