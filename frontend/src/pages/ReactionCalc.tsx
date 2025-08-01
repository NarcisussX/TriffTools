import React, { useEffect, useState } from "react";
import axios from "axios";

const hybridBlueprintIDs = [
  46157, 46159, 46160, 46161, 46162, 46163, 46164, 46165
];

const ReactionCalc: React.FC = () => {
  const [station, setStation] = useState("Jita 4-4");
  const [pricingModeInput, setPricingModeInput] = useState("sell");
  const [pricingModeOutput, setPricingModeOutput] = useState("buy");
  const [reactionSkill, setReactionSkill] = useState(0);
  const [structureType, setStructureType] = useState("Station");
  const [rig1, setRig1] = useState("None");
  const [rig2, setRig2] = useState("None");
  const [systemCostIndex, setSystemCostIndex] = useState(0);
  const [facilityTaxPercent, setFacilityTaxPercent] = useState(0);
  const [securityStatus, setSecurityStatus] = useState("low");
  const [results, setResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const payload = {
        station,
        inputPricingMode: pricingModeInput,
        outputPricingMode: pricingModeOutput,
        reactionSkill,
        structureType,
        meRig: rig1, // Must be "None" | "T1" | "T2"
        teRig: rig2,
        systemCostIndex,
        facilityTaxPercent,
        securityStatus
      };

      const all = await Promise.all(
        hybridBlueprintIDs.map(async (blueprintID) => {
          try {
            const { data } = await axios.post("/api/reaction-calc", {
              blueprintID,
              ...payload,
            });
            return data;
          } catch {
            return null;
          }
        })
      );
      setResults(all.filter(Boolean));
    };
    fetchAll();
  }, [station, pricingModeInput, pricingModeOutput, reactionSkill, structureType, rig1, rig2, systemCostIndex, facilityTaxPercent, securityStatus]);

  return (
    <div className="max-w-6xl mx-auto p-4 text-white">
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded shadow-md text-sm text-gray-300">
          <p className="mb-1">
            Someday I'll add support for Biochemical and Composite reactions, which should be easy, as well as for time calculations (which shouldn't be easy tbh). I also need to add support for market taxes and broker fees, but I wanna go play Minecraft so I'm done with this for now.
          </p>
        </div>
      <h1 className="text-3xl font-bold mb-4">Hybrid Reaction Calculator</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/*<label className="flex flex-col">
          <span className="mb-1">Station</span>
          <input value={station} onChange={e => setStation(e.target.value)} className="bg-gray-800 p-2 rounded" />
        </label> */}

        <label className="flex flex-col">
          <span className="mb-1">Input Pricing Mode</span>
          <select value={pricingModeInput} onChange={e => setPricingModeInput(e.target.value)} className="bg-gray-800 p-2 rounded">
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="mb-1">Output Pricing Mode</span>
          <select value={pricingModeOutput} onChange={e => setPricingModeOutput(e.target.value)} className="bg-gray-800 p-2 rounded">
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="mb-1">Reaction Skill Level</span>
          <input type="number" min={0} max={5} value={reactionSkill} onChange={e => setReactionSkill(Number(e.target.value))} className="bg-gray-800 p-2 rounded" />
        </label>

        <label className="flex flex-col">
          <span className="mb-1">Structure Type</span>
          <select value={structureType} onChange={e => setStructureType(e.target.value)} className="bg-gray-800 p-2 rounded">
            <option>Station</option>
            <option>Athanor</option>
            <option>Tatara</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="mb-1">ME Rig</span>
          <select value={rig1} onChange={e => setRig1(e.target.value)} className="bg-gray-800 p-2 rounded">
            <option>None</option>
            <option>T1</option>
            <option>T2</option>
          </select>
        </label>

        {/*<label className="flex flex-col">
          <span className="mb-1">TE Rig</span>
          <select value={rig2} onChange={e => setRig2(e.target.value)} className="bg-gray-800 p-2 rounded">
            <option>None</option>
            <option>T1</option>
            <option>T2</option>
          </select>
        </label> */}

        <label className="flex flex-col">
          <span className="mb-1">Security Status</span>
          <select value={securityStatus} onChange={e => setSecurityStatus(e.target.value)} className="bg-gray-800 p-2 rounded">
            <option value="low">Low-sec</option>
            <option value="null">Null-sec</option>
            <option value="wh">Wormhole</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="mb-1">System Cost Index (%)</span>
          <input type="number" step="0.0001" value={systemCostIndex} onChange={e => setSystemCostIndex(Number(e.target.value))} className="bg-gray-800 p-2 rounded" />
        </label>

        <label className="flex flex-col">
          <span className="mb-1">Facility Tax %</span>
          <input type="number" step="0.01" value={facilityTaxPercent} onChange={e => setFacilityTaxPercent(Number(e.target.value))} className="bg-gray-800 p-2 rounded" />
        </label>
      </div>

<table className="w-full text-sm text-left border border-gray-700">
  <thead>
    <tr className="bg-gray-800">
      <th className="px-4 py-2 border">Product</th>
      <th className="px-4 py-2 border">Input Cost</th>
      <th className="px-4 py-2 border">Taxes</th>
      <th className="px-4 py-2 border">Output Value</th>
      <th className="px-4 py-2 border">Profit</th>
      <th className="px-4 py-2 border">% Profit</th>
    </tr>
  </thead>
  <tbody>
    {results.map(r => {
      const profitColor = r.profit >= 0 ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200";
      const profitPercent = r.inputCost > 0 ? (r.profit / r.inputCost) * 100 : 0;

      return (
        <tr
          key={r.blueprintID}
          className={`hover:bg-gray-700 cursor-pointer ${profitColor}`}
          onClick={() => setSelectedResult(r)}
        >
          <td className="px-4 py-2 border">{r.outputs[0]?.name}</td>
          <td className="px-4 py-2 border">{r.inputCost.toLocaleString()} ISK</td>
          <td className="px-4 py-2 border">{r.totalTaxes.toLocaleString()} ISK</td>
          <td className="px-4 py-2 border">{r.outputValue.toLocaleString()} ISK</td>
          <td className="px-4 py-2 border">{r.profit.toLocaleString()} ISK</td>
          <td className="px-4 py-2 border">{profitPercent.toFixed(2)}%</td>
        </tr>
      );
    })}
  </tbody>
</table>



{selectedResult && (

  <div
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
    onClick={() => setSelectedResult(null)}
  >
    <div
      className="bg-gray-900 border border-gray-600 p-6 rounded shadow-lg w-full max-w-5xl relative z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">{selectedResult.outputs[0]?.name}</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* INPUTS */}
        <div>
          <h3 className="text-lg font-bold mb-2 text-red-300">INPUTS</h3>
          <table className="w-full text-sm border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-2 py-1 border">Name</th>
                <th className="px-2 py-1 border">Quantity</th>
                <th className="px-2 py-1 border">Price</th>
              </tr>
            </thead>
            <tbody>
{selectedResult.inputs.map((i: any) => {
  const price = selectedResult.prices[i.typeID]?.[selectedResult.inputPricingMode] ?? 0;
  return (
    <tr key={i.typeID}>
      <td className="border px-2 py-1">{i.name}</td>
      <td className="border px-2 py-1">{i.quantity}</td>
      <td className="border px-2 py-1">{price.toLocaleString()} ISK</td>
    </tr>
  );
})}
              <tr className="font-bold bg-gray-800">
                <td className="border px-2 py-1" colSpan={2}>TOTAL</td>
                <td className="border px-2 py-1">{selectedResult.inputCost.toLocaleString()} ISK</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* OUTPUTS */}
        <div>
          <h3 className="text-lg font-bold mb-2 text-green-300">OUTPUTS</h3>
          <table className="w-full text-sm border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-2 py-1 border">Name</th>
                <th className="px-2 py-1 border">Quantity</th>
                <th className="px-2 py-1 border">Price</th>
              </tr>
            </thead>
            <tbody>
{selectedResult.outputs.map((o: any) => {
  const price = selectedResult.prices[o.typeID]?.[selectedResult.outputPricingMode] ?? 0;
  return (
    <tr key={o.typeID}>
      <td className="border px-2 py-1">{o.name}</td>
      <td className="border px-2 py-1">{o.quantity}</td>
      <td className="border px-2 py-1">{price.toLocaleString()} ISK</td>
    </tr>
  );
})}
              <tr className="font-bold bg-gray-800">
                <td className="border px-2 py-1" colSpan={2}>TOTAL</td>
                <td className="border px-2 py-1">{selectedResult.outputValue.toLocaleString()} ISK</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TAXES */}
        <div>
          <h3 className="text-lg font-bold mb-2 text-blue-300">TAXES</h3>
          <table className="w-full text-sm border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-2 py-1 border">Name</th>
                <th className="px-2 py-1 border">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">Job Install Cost</td>
                <td className="border px-2 py-1">{selectedResult.jobInstallCost.toLocaleString()} ISK</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Facility Tax</td>
                <td className="border px-2 py-1">{selectedResult.facilityTax.toLocaleString()} ISK</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">SCC Tax</td>
                <td className="border px-2 py-1">{selectedResult.sccTax.toLocaleString()} ISK</td>
              </tr>
              <tr className="font-bold bg-gray-800">
                <td className="border px-2 py-1">TOTAL</td>
                <td className="border px-2 py-1">{selectedResult.totalTaxes.toLocaleString()} ISK</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PROFIT REPORT */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2 text-cyan-300">PROFIT REPORT</h3>
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Inputs</td>
              <td className="border px-4 py-2">{selectedResult.inputCost.toLocaleString()} ISK</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Taxes</td>
              <td className="border px-4 py-2">{selectedResult.totalTaxes.toLocaleString()} ISK</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Output</td>
              <td className="border px-4 py-2">{selectedResult.outputValue.toLocaleString()} ISK</td>
            </tr>
            <tr className="font-bold bg-gray-800">
              <td className="border px-4 py-2">TOTAL</td>
              <td className="border px-4 py-2">{selectedResult.profit.toLocaleString()} ISK</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ReactionCalc;
