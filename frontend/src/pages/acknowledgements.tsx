import React from "react";

export default function Acknowledgements() {
  return (
    <div className="relative min-h-screen bg-[#1e1f29] text-gray-100 font-mono overflow-hidden">
      <div className="absolute inset-0 z-0 animate-starfield pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400/20 to-transparent z-10" />
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-blue-400/20 to-transparent z-10" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-white">Acknowledgements</h1>

        <div className="space-y-6 text-base text-gray-300">
          <p>
            This project wouldn't be possible without the help, inspiration, and resources from many sources. Special thanks to:
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">The folks at URSA</span> — for giving me countless ways to continue enjoying J-Space.
            </li>
            <li>
              <span className="text-white font-semibold">Rykki, Karr, Nolak, and Grubu</span> — for the OG wormhole combat site reference.
            </li>
            <li>
              <span className="text-white font-semibold">EVE Wormhole Gas Sites Google Doc</span> — for the inspiration that started this site.
            </li>
            <li>
              <span className="text-white font-semibold">Algar Thesant</span> — for the best rolling battleship reference chart on the internet.
            </li>
            <li>
              <span className="text-white font-semibold">GESI</span> — for the tools to make my first eve tool (PIP-C) in google docs.
            </li>
            <li>
              <span className="text-white font-semibold">Derz</span> — for the idea behind the ratting split calculator.
            </li>
            <li>
              <span className="text-white font-semibold">Friends in Wormhole Space</span> — for C5/C6 stat logging, fleet comps, and testing.
            </li>
            <li>
              <span className="text-white font-semibold">Fuzzwork.co.uk</span> — for the market data API used in the early iterations of my calculations.
            </li>
            <li>
              <span className="text-white font-semibold">Pathfinder, Tripwire, and other WH tools</span> — for pioneering the way WH information is shared.
            </li>
            <li>
              <span className="text-white font-semibold">Postgres, Express, and Node</span> — for powering the backend structure.
            </li>
            <li>
              <span className="text-white font-semibold">React, TailwindCSS, and Lucide Icons</span> — for powering the frontend structure.
            </li>
            <li>
              <span className="text-white font-semibold">OpenAI</span> — for enabling the AI component.
            </li>
            <li>
              <span className="text-white font-semibold">My Girlfriend</span> — for her support, patience, and encouragement throughout development.
            </li>
          </ul>

          <p>
            If you helped and weren’t listed, you know who you are — thank you.
          </p>

          <p>
            If you would like to contribute or request features my discord is: triffnix.
          </p>
        </div>
      </div>
    </div>
  );
}
