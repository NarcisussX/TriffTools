import React, { useState, useEffect } from 'react';

type Blueprint = {
  blueprintID: string;
  blueprintName: string;
  materials: any;
};

const STATIONS = [
  { name: 'Jita 4-4', value: 'Jita 4-4' },
  { name: 'Amarr VIII', value: 'Amarr VIII' },
  { name: 'Dodixie', value: 'Dodixie' },
  { name: 'Rens', value: 'Rens' },
];

// Add this under STATIONS
const STRUCTURES = [
  { name: 'Non-Bonused Structure', value: 'Non-Bonused Structure' },
  { name: 'Raitaru', value: 'Raitaru' },
  { name: 'Azbel', value: 'Azbel' },
  { name: 'Sotiyo', value: 'Sotiyo' },
];

type IndustrySystem = {
  solar_system_id: number;
  system_name: string;
};

export default function IndustryCalc() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>('');
  const [me, setMe] = useState(0);
  const [runs, setRuns] = useState(1);
  const [station, setStation] = useState('Jita 4-4');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [structure, setStructure] = useState('None');
  const [systems, setSystems] = useState<IndustrySystem[]>([]);
  const [system, setSystem] = useState<string>('30000142'); // Jita ID default once loaded
  const [jobCostOverride, setJobCostOverride] = useState<string>('');

useEffect(() => {
  fetch('/api/industry/systems')
    .then(res => res.json())
    .then(data => {
      setSystems(data);
      // default to Jita if present
      const jita = data.find((s: IndustrySystem) => s.system_name === 'Jita');
      if (jita) setSystem(String(jita.solar_system_id));
    })
    .catch(err => {
      console.error('Failed to load systems', err);
      setSystems([]);
    });
}, []);

  // Load blueprints on mount
  useEffect(() => {
    // Ideally fetch from your backend, or import if you bundle blueprints.json
    fetch('/api/industry/blueprints') // <-- implement this endpoint or serve file
      .then(res => res.json())
      .then(data => setBlueprints(Object.values(data)))
      .catch(() => setBlueprints([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
const params = new URLSearchParams({
  blueprint: selectedBlueprint,
  me: String(me),
  runs: String(runs),
  station,
  structure,
  system,
});

if (jobCostOverride && jobCostOverride.trim() !== '') {
  params.append('jobCostOverride', jobCostOverride);
}

const res = await fetch(`/api/industry/buildcost?${params}`);
    const data = await res.json();
    console.log(data)
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl mx-auto mt-8 rounded-2xl bg-slate-800/90 shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-300 tracking-tight">Industry Calculator</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Blueprint</label>
            <select
              required
              value={selectedBlueprint}
              onChange={e => setSelectedBlueprint(e.target.value)}
              className="w-full rounded-xl bg-gray-900 text-gray-100 border border-gray-600 p-2"
            >
              <option value="" disabled>Select a blueprint...</option>
              {blueprints.map(bp => (
                <option key={bp.blueprintID} value={bp.blueprintID}>{bp.blueprintName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-4 gap-4">
  <div>
    <label className="block text-xs text-gray-400 mb-1">ME</label>
    <input
      type="number"
      value={me}
      onChange={e => setMe(Number(e.target.value))}
      min={0}
      max={10}
      className="w-full rounded-xl bg-gray-900 border border-gray-600 p-2"
    />
  </div>
  <div>
    <label className="block text-xs text-gray-400 mb-1">Runs</label>
    <input
      type="number"
      value={runs}
      onChange={e => setRuns(Number(e.target.value))}
      min={1}
      className="w-full rounded-xl bg-gray-900 border border-gray-600 p-2"
    />
  </div>
  <div className="mb-4">
  <label className="block text-xs text-gray-400 mb-1">System</label>
<select
  value={system}
  onChange={e => setSystem(e.target.value)}
  className="w-full rounded-xl bg-gray-900 text-gray-100 border border-gray-600 p-2"
>
  {systems.map(s => (
    <option key={s.solar_system_id} value={s.solar_system_id}>
      {s.system_name}
    </option>
  ))}
</select>
<div className="mb-4">
  <label className="block text-xs text-gray-400 mb-1">
    Override Job Cost Index (optional)
  </label>
  <input
    type="number"
    step="0.0001"
    min="0"
    placeholder="e.g. 0.0123"
    value={jobCostOverride}
    onChange={(e) => setJobCostOverride(e.target.value)}
    className="w-full p-2 bg-gray-800 border border-gray-600 text-white rounded"
  />
</div>
</div>
  <div>
    <label className="block text-xs text-gray-400 mb-1">Structure</label>
    <select
      value={structure}
      onChange={e => setStructure(e.target.value)}
      className="w-full rounded-xl bg-gray-900 text-gray-100 border border-gray-600 p-2"
    >
      {STRUCTURES.map(s => (
        <option key={s.value} value={s.value}>{s.name}</option>
      ))}
    </select>
  </div>
</div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-600 font-bold tracking-wide text-lg shadow-lg mt-4"
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate Build Cost"}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-4 bg-gray-900 rounded-xl shadow-inner">
            <h2 className="text-xl font-semibold text-blue-200 mb-2">
              {result.blueprintName}
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div><span className="text-gray-400">Runs:</span> {result.runs}</div>
              <div><span className="text-gray-400">ME:</span> {result.ME}</div>
              <div><span className="text-gray-400">Market Hub:</span> {result.station}</div>
              <div><span className="text-gray-400">Structure:</span> {structure}</div>
            </div>
            <div>
              <h3 className="font-bold text-gray-300 mb-1">Materials</h3>
              <table className="w-full text-sm border-collapse mb-2">
                <thead>
                  <tr>
                    <th className="text-left py-1">Item</th>
                    <th>Qty</th>
                    <th>Sell</th>
                    <th>Buy</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.materials.map((mat: any) => (
                    <tr key={mat.typeID}>
                      <td>{mat.name}</td>
                      <td>{mat.adjustedQuantity}</td>
                      <td>{mat.price.sell?.toLocaleString()}</td>
                      <td>{mat.price.buy?.toLocaleString()}</td>
                      <td className="font-bold">{mat.costSell?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right font-bold text-blue-300 text-lg">
                Total ISK Cost (Sell): {result.totalCost.sell?.toLocaleString()}
              </div>
              {typeof result?.jobCost?.avg === 'number' && result.jobCost.avg > 0 && (
  <div className="text-right mt-2 text-sm text-purple-300">
    <strong>Job Cost:</strong> {result.jobCost.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })} ISK
  </div>
)}
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-gray-300 mb-1">Products</h3>
              <ul>
                {result.products.map((prod: any) => (
                  <li key={prod.typeID}>
                    {prod.name} × {prod.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
