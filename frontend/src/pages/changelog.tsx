import React from "react";

export default function Changelog() {
  return (
    <div className="font-mono">
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-white">Changelog</h1>

        <div className="space-y-6 text-base text-gray-300">
          <p>
            8/07/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Added participation-based blue loot calculator - /participation</span> - Suggested by Axium
            </li>
          </ul>
          <p></p>
          <p>
            8/03/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Bug: O477 WH's were listed as C2</span> - Found by Axium
            </li>
            <li>
              <span className="text-white font-semibold">Bug: Trigger-only toggle caused Peak DPS/Alpha/Neut to recalculate</span> - Found by Axium
            </li>
            <li>
              <span className="text-white font-semibold">Allowed sorting on Ore/Gas/Reactions calculator return tables</span> - Suggested by Axium
            </li>
            <li>
              <span className="text-white font-semibold">Added "No tackle" badge to sites with no tackle in PvE reference page</span> - Suggested by Axium
            </li>
          </ul>
          <p>
            8/01/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Updated domain name to triff.tools - old (triffnix.com) will redirect.</span>
            </li>
            <li>
              <span className="text-white font-semibold">Added peak Alpha stat to wormhole PvE sites</span> - Suggested by Styx
            </li>
            <li>
              <span className="text-white font-semibold">Addjusted PvE site waves to show dps/ehp/alpha per ship</span> - Suggested by Styx
            </li>
          </ul>
          <p>
            7/31/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Add hybrid reactions calculator - /reaction-calc</span>
            </li>
          </ul>
          <p>
            7/29/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Added DPS/Logi toggle to Blue loot share splitter</span> - Suggested by Kattar
            </li>
          </ul>
          <p>
            7/26/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Add wormhole database - /wormholes</span>
            </li>
            <li>
              <span className="text-white font-semibold">Minor UI/UX upgrades</span>
            </li>
            <li>
              <span className="text-white font-semibold">New DB and API schema to accommodate wormhole database</span>
            </li>
          </ul>
          <p>
            7/25/2025
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Add EVE time converter and discord timestamp generator - /timestamp</span>
            </li>
            <li>
              <span className="text-white font-semibold">Update navbar to drawer</span>
            </li>
            <li>
              <span className="text-white font-semibold">Add current TQ population count to header</span>
            </li>
          </ul>
          
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
