import { Link } from "react-router-dom";

const TOOLS = [
  {
    name: "Gas Huffing Calculator",
    link: "/gas-calc",
    desc: "Maximize gas profits with live market data & full boosting math.",
    icon: "⛽️️"
  },
  {
    name: "Ore Mining Calculator",
    link: "/ore",
    desc: "Gas calculator, but for ore. Including boosting math.",
    icon: "⛏️"
  },
  {
    name: "PI Profitability Calculator",
    link: "/pi-calc",
    desc: "Batch profit calculator for all Planetary Interaction chains.",
    icon: "🪐"
  },
  {
    name: "Blue Loot Splitter",
    link: "/bloot",
    desc: "Fast, fair wormhole ratting ISK split by share or role.",
    icon: "💎"
  },
    {
    name: "Hole Rolling Guide",
    link: "/rolling-mass",
    desc: "Quick reference cheat sheet for rolling wormholes.",
    icon: "🕳️"
  },
  {
    name: "Wormhole PvE Sites",
    link: "/wormhole-sites",
    desc: "Reference sheet for all sleeper combat/data/relic sites in J space.",
    icon: "💥"
  },
  {
    name: "Time Converter",
    link: "/timestamp",
    desc: "Both a Discord timestamp generator and EVE time converter.",
    icon: "📅"
  },
  {
    name: "Wormhole Database",
    link: "/wormholes",
    desc: "Wormhole database/search tool heavily inspired by Anoik.is.",
    icon: "🗺️"
  },
  {
    name: "Roadmap",
    link: "/roadmap",
    desc: "What's next for Triff.Tools",
    icon: "📍"
  },
  {
    name: "Changelog",
    link: "/changelog",
    desc: "What's no longer next for Triff.Tools",
    icon: "📝"
  },
  //{
  //  name: "Acknowledgements",
  //  link: "/acknowledgements",
  //  desc: "The people who made this project possible.",
  //  icon: "💬"
  //},
];

export default function Landing() {
  return (
    <div>
      <div className="max-w-3xl mx-auto px-5 py-20 relative z-10 flex flex-col items-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold mb-2 text-white-200 drop-shadow-[0_0_16px_white]">
          Triff.Tools
        </h1>
        <div className="text-lg sm:text-2xl font-medium text-blue-200 mb-8 text-center ">
          The EVE Online Wormhole Utility Suite<br />
          <span className="text-cyan-100 font-semibold tracking-wider">A premier one-stop-shop wormhole reference tool.</span>
        </div>
        <Link
          to="/gas-calc"
          className="bg-blue-700 hover:bg-accent px-8 py-3 mb-12 rounded-xl text-xl font-semibold shadow-lg transition-colors"
        >
          Start Calculating
        </Link>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.name}
              to={tool.link}
              className="group bg-gray-900/70 border border-accent/30 rounded-xl p-6 shadow-xl flex items-center space-x-4 hover:bg-accent/20 transition"
            >
              <span className="text-3xl">{tool.icon}</span>
              <div>
                <div className="text-lg font-extrabold text-blue-200 group-hover:text-white drop-shadow-sm">{tool.name}</div>
                <div className="text-gray-300 group-hover:text-gray-100 text-sm">{tool.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 text-sm text-gray-500 text-center">
          Not affiliated with CCP Games | Made by Triffnix<br />
          <span className="text-xs">EVE Online and all related trademarks are property of CCP hf.</span>
        </div>
      </div>
    </div>
  );
}
