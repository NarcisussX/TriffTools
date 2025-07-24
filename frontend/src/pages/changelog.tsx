import React from "react";

export default function Changelog() {
  return (
    <div className="font-mono">
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-white">Changelog</h1>

        <div className="space-y-6 text-base text-gray-300">
          <p>
            7/24/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Add ore mining calculator - /ore</span>
            </li>
          </ul>
          <p>
            7/23/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Only show scoops for frigates/collectors for barges in gas calc</span> — Suggested by Sorf
            </li>
            <li>
              <span className="text-white font-semibold">Add custom + share value to bloot calc</span> — Suggested by Absurdly
            </li>
            <li>
              <span className="text-white font-semibold">Trigger ship view only on PvE sites (Trigger-Only Toggle)</span> — Suggested by Luxx
            </li>
            <li>
              <span className="text-white font-semibold">Drifter toggle for blue loot split calculator</span> - Suggested by Battleangel
            </li>
          </ul>

          <p>
            7/22/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Added Changelog page to /changelog</span>
            </li>
            <li>
              <span className="text-white font-semibold">Added Roadmap page to /roadmap</span>
            </li>
            <li>
              <span className="text-white font-semibold">Made animated background toggleable</span> - Suggested by Sorf
            </li>
            <li>
              <span className="text-white font-semibold">Updated outlier hole-rolling instructions</span> - Suggested by Sorf
            </li>
            <li>
              <span className="text-white font-semibold">Added Upgraded Avengers C5/C6 Sites if big drifter active</span> - Suggested by Sorf
            </li>
            <li>
              <span className="text-white font-semibold">Changed DTA to DTR in PvE sites</span> - Suggested by Sorf
            </li>
            <li>
              <span className="text-white font-semibold">Fixed drifter orbit range statistic</span> - Suggested by Sorf
            </li>
            <li>
              <span className="text-white font-semibold">Added Blue loot calculator split shares calculation info</span> - Suggested by Sorf
            </li>
            <li>
              <span className="text-white font-semibold">Added residue calculations to gas huffing calculator</span> - Suggested by Sorf
            </li>
            <li>
              <span className="text-white font-semibold">Eliminated redundant implants in Gas Calculator</span> - Suggested by Sorf
            </li>
            <li>
              <span className="text-white font-semibold">Changed gas-huffing boost dropdown from "Bastion" to "industrial Core"</span> - Suggested by Alan
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
