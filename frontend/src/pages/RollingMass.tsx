import React from "react";

const COLORS = {
  blue: {
    border: "border-blue-600",
    bg: "bg-blue-900/80",
    box: "bg-blue-800 border-blue-600",
  },
  green: {
    border: "border-green-700",
    bg: "bg-green-900/80",
    box: "bg-green-800 border-green-700",
  },
  gold: {
    border: "border-yellow-700",
    bg: "bg-yellow-900/80",
    box: "bg-yellow-800 border-yellow-700",
  },
  orange: {
    border: "border-orange-700",
    bg: "bg-orange-900/80",
    box: "bg-orange-800 border-orange-700",
  }
};

const DATA = [
  {
    label: "1000Gg",
    color: "blue",
    codes: ["D364", "O128", "M267", "X702"],
    jump: {
      main: ["1 Cold Jump", "1 Hot Jump"],
      note: "Is the hole reduced?"
    },
    yes: {
      roll: ["2 Hot Jumps"],
      crit: ["2 Cold Jumps"]
    },
    no: {
      roll: ["2 Hot Jumps"],
      crit: ["1 Cold Jump", "1 Hot Jump"]
    }
  },
  {
    label: "2000Gg",
    color: "green",
    codes: [
      "A239", "B449", "E175", "I182",
      "N968", "X877", "A641", "C247",
      "E545", "L477", "Q877", "Y683",
      "B274", "D382", "N766", "T405",
      "Z457"
    ],
    jump: {
      main: ["2 Cold Jumps", "2 Hot Jumps"],
      note: "Is the hole reduced?"
    },
    yes: {
      roll: ["2 Hot Jumps", "2 Cold Jumps"],
      crit: ["4 Cold Jumps"]
    },
    no: {
      roll: ["4 Hot Jumps"],
      crit: ["2 Cold Jumps", "2 Hot Jumps"]
    }
  },
  {
    label: "3000Gg",
    color: "gold",
    codes: [
      "A982", "M555", "N770", "R474",
      "U319", "A641", "H900", "N062",
      "N944", "S199", "U574", "B274",
      "K346", "N432", "R051", "U210",
      "V283"
    ],
    jump: {
      main: ["5 Hot Jumps"],
      note: "Is the hole reduced?"
    },
    yes: {
      roll: ["Return Hot", "4 Hot Jumps"],
      crit: ["Return Cold", "2 Cold Jumps", "2 Hot Jumps"]
    },
    no: {
      roll: ["Return Hot", "3 Cold Jumps", "3 Hot Jumps"],
      crit: ["Return Cold", "2 Cold Jumps", "2 Hot Jumps"]
    }
  },
  {
    label: "3300Gg",
    color: "orange",
    codes: [
      "B520", "C248", "D792", "W237",
      "C140", "C391", "H296", "Z142",
      "V911"
    ],
    jump: {
      main: ["1 Cold Jump", "5 Hot Jumps"],
      note: "Is the hole reduced?"
    },
    yes: {
      roll: ["2 Cold Jumps", "4 Hot Jumps"],
      crit: ["4 Hot Jumps", "HIC once", "(if needed)"]
    },
    no: {
      roll: ["6 Hot Jumps", "HIC once", "(if needed)"],
      crit: ["1 Cold Jump", "5 Hot Jumps"]
    }
  }
];

const CodeGrid = ({ codes }) => (
  <div className="grid grid-cols-4 gap-2 w-full items-start pt-2">
    {codes.map((c, i) => (
      <div
        key={c + i}
        className="rounded-md px-2 py-1 text-base font-semibold shadow-sm bg-white/10 border border-white/15 text-white text-center min-w-[48px]"
      >
        {c}
      </div>
    ))}
  </div>
);

const JumpBox = ({ jump }) => (
  <div className="flex flex-col items-center justify-center h-full w-full px-2 py-2">
    <div className="text-lg font-bold text-white text-center leading-tight">
      {jump.main.map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
    </div>
    <div className="italic text-base text-white/80 text-center mt-1">{jump.note}</div>
  </div>
);

const YesBox = ({ yes, color }) => (
  <div className={`rounded-xl border-2 ${COLORS[color].border} ${COLORS[color].box} w-full flex flex-col items-start justify-start min-h-[195px] px-3 py-2`}>
    <div className="text-base font-extrabold text-white mb-1 text-center tracking-tight w-full">YES</div>
    <div className="font-bold mb-0.5 text-[0.98rem] leading-tight">To Roll:</div>
    <ul className="ml-3 mb-1 text-sm leading-tight">
      {yes.roll.length ? yes.roll.map((r, i) => <li key={i} className="text-white whitespace-nowrap">{r}</li>) : <li className="text-white/40">—</li>}
    </ul>
    <div className="font-bold mb-0.5 text-[0.98rem] leading-tight">To Crit:</div>
    <ul className="ml-3 text-sm leading-tight">
      {yes.crit.length ? yes.crit.map((r, i) => <li key={i} className="text-white whitespace-nowrap">{r}</li>) : <li className="text-white/40">—</li>}
    </ul>
  </div>
);

const NoBox = ({ no, color }) => (
  <div className={`rounded-xl border-2 ${COLORS[color].border} ${COLORS[color].box} w-full flex flex-col items-start justify-start min-h-[195px] px-3 py-2`}>
    <div className="text-base font-extrabold text-white mb-1 text-center tracking-tight w-full">NO</div>
    <div className="font-bold mb-0.5 text-[0.98rem] leading-tight">To Roll:</div>
    <ul className="ml-3 mb-1 text-sm leading-tight">
      {no.roll.length ? no.roll.map((r, i) => <li key={i} className="text-white whitespace-nowrap">{r}</li>) : <li className="text-white/40">—</li>}
    </ul>
    <div className="font-bold mb-0.5 text-[0.98rem] leading-tight">To Crit:</div>
    <ul className="ml-3 text-sm leading-tight">
      {no.crit.length ? no.crit.map((r, i) => <li key={i} className="text-white whitespace-nowrap">{r}</li>) : <li className="text-white/40">—</li>}
    </ul>
  </div>
);

export default function RollingMass() {
  // You can tweak these for row heights if needed
  const rowHeights = {
    codes: "min-h-[250px]",
    jumps: "min-h-[76px]",
    yesno: "min-h-[195px]",
  };

  return (
        <div className="font-mono">
    <div className="w-full flex flex-col items-center pt-8 px-2">
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded shadow-md text-sm text-gray-300">
  <span className="text-muted-foreground">
    This page is a quick-reference chart for rolling wormhole connections using battleships with standard mass fits (200,000 kg cold, ~300,000 kg hot). 
    <br /><br />
    Use this chart to find your wormhole’s type, check the total mass allowance, and plan your jumps—minimizing risk and maximizing control. The breakdown for 1000Gg, 2000Gg, 3000Gg, and 3300Gg holes covers the required number of jumps, “hot” vs “cold” (prop mod on vs off), and steps to crit for hole control. Each section shows the recommended jump sequence and whether a heavy interdictor (HIC) is needed for perfect mass management.
    <br /><br />
    For outlier cases, if the hole has had significant mass through it but is not reduced or if the hole is already reduced with unkown mass through it, just do cold-hots until it crits then HIC once (or twice). Reduced 1000Gg holes are best rolled using HICs, as it wont crit until it hits 100,000 mass remaining, and a cold jump may close it before showing crit. 
  </span>
        </div>
        </div>
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Row 1: Codes */}
        <div className="flex flex-row gap-4 w-full mb-2">
          {DATA.map((d) => (
            <div
              key={d.label + "-codes"}
              className={`rounded-xl border-2 ${COLORS[d.color].border} ${COLORS[d.color].bg} px-4 pt-4 pb-2 flex flex-col items-center w-full ${rowHeights.codes} justify-start`}
            >
              <div className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow">{d.label}</div>
              <CodeGrid codes={d.codes} />
            </div>
          ))}
        </div>
        {/* Row 2: Instructions */}
        <div className="flex flex-row gap-4 w-full mb-2">
          {DATA.map((d) => (
            <div
              key={d.label + "-jumps"}
              className={`rounded-xl border-2 ${COLORS[d.color].border} ${COLORS[d.color].box} w-full flex items-center justify-center ${rowHeights.jumps}`}
            >
              <JumpBox jump={d.jump} />
            </div>
          ))}
        </div>
        {/* Row 3: YES and NO as separate boxes */}
<div className="flex flex-row gap-4 w-full">
  {DATA.map((d, idx) => (
    <div key={d.label + "-yesno-pair"} className="flex flex-row w-1/4 gap-2">
      <YesBox yes={d.yes} color={d.color} className="flex-1" />
      <NoBox no={d.no} color={d.color} className="flex-1" />
    </div>
  ))}
</div>
      </div>
    </div>
    </div>
  );
}
