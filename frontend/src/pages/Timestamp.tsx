import { useEffect, useState } from "react";
import timezones from "../components/timezones.json";

export default function TimestampTool() {
  const now = new Date();
  const defaultDate = now.toISOString().split("T")[0];
  const defaultTime = now.toTimeString().slice(0, 8);

  const [date, setDate] = useState<string>(defaultDate);
  const [time, setTime] = useState<string>(defaultTime);
  const [timezone, setTimezone] = useState<string>(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timezoneInput, setTimezoneInput] = useState<string>("");
  const [unix, setUnix] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [eveNow, setEveNow] = useState<string>("");
  const [eveFuture, setEveFuture] = useState<string>("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const updateEveTime = () => {
      const nowUTC = new Date().toISOString().slice(0, 19).replace("T", " ");
      setEveNow(nowUTC);
    };
    updateEveTime();
    const interval = setInterval(updateEveTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const localDT = new Date(`${date}T${time}`);
      const utcSeconds = Math.floor(localDT.getTime() / 1000);
      setUnix(utcSeconds);
      const futureUTC = new Date(localDT.getTime()).toISOString().slice(0, 19).replace("T", " ");
      setEveFuture(futureUTC);
    } catch {
      setUnix(0);
    }
  }, [date, time]);

  const formats = [
    { label: "d", desc: "Short Date" },
    { label: "D", desc: "Long Date" },
    { label: "t", desc: "Short Time" },
    { label: "T", desc: "Long Time" },
    { label: "f", desc: "Short Date+Time" },
    { label: "F", desc: "Full Date+Time" },
    { label: "R", desc: "Relative Time" },
  ];

  const renderFormat = (label: string): string => {
    const d = new Date(unix * 1000);
    switch (label) {
      case "d": return d.toLocaleDateString();
      case "D": return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      case "t": return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      case "T": return d.toLocaleTimeString();
      case "f": return d.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      case "F": return d.toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      case "R": return getRelativeTimeString(unix);
      default: return "";
    }
  };

  const getRelativeTimeString = (timestamp: number) => {
    const diff = Math.floor(timestamp - Date.now() / 1000);
    const abs = Math.abs(diff);
    const suffix = diff < 0 ? "ago" : "from now";
    if (abs < 60) return `${abs} seconds ${suffix}`;
    if (abs < 3600) return `${Math.floor(abs / 60)} minutes ${suffix}`;
    if (abs < 86400) return `${Math.floor(abs / 3600)} hours ${suffix}`;
    return `${Math.floor(abs / 86400)} days ${suffix}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    });
  };

  const resetToNow = () => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().slice(0, 8));
  };

  const filteredZones = timezones.filter((tz) =>
    tz.toLowerCase().includes(timezoneInput.toLowerCase())
  );

  return (
    <div className="font-mono">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-6">Discord Timestamp Generator</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-[rgba(20,25,40,0.75)] border border-gray-700 rounded p-4 shadow-md">
          <div>
            <label className="block mb-1 text-sm">📅 Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">🕒 Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              step="1"
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>

          <div className="relative">
            <label className="block mb-1 text-sm">🌐 Timezone</label>
            <input
              type="text"
              value={timezoneInput}
              onChange={(e) => {
                setTimezoneInput(e.target.value);
              }}
              placeholder={timezone}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
              onFocus={() => setTimezoneInput("")}
            />
            {timezoneInput && (
              <ul className="absolute z-20 max-h-48 overflow-auto mt-1 w-full bg-gray-900 border border-gray-600 rounded text-sm text-white">
                {filteredZones.slice(0, 20).map((tz) => (
                  <li
                    key={tz}
                    className="px-3 py-1 hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setTimezone(tz);
                      setTimezoneInput(tz);
                    }}
                  >
                    {tz}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mb-6 text-xl text-center text-white bg-[rgba(20,25,40,0.75)] border border-gray-700 rounded p-4 shadow">
          ⏰ <span className="font-semibold text-white">Current EVE Time (UTC):</span> <span className="text-blue-300 font-mono">{eveNow}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-700 text-sm text-white">
            <thead className="bg-gray-900">
              <tr>
                <th className="border px-3 py-2 text-left">Chat Syntax</th>
                <th className="border px-3 py-2 text-left">Example Result</th>
                <th className="border px-3 py-2 text-left">Description</th>
                <th className="border px-3 py-2 text-left">Copy</th>
              </tr>
            </thead>
            <tbody>
              {formats.map((f) => (
                <tr key={f.label} className="bg-gray-800 border-t border-gray-700">
                  <td className="border px-3 py-2 text-blue-300 font-mono">{`<t:${unix}:${f.label}>`}</td>
                  <td className="border px-3 py-2 text-white">{renderFormat(f.label)}</td>
                  <td className="border px-3 py-2 text-gray-400">{f.desc}</td>
                  <td className="border px-3 py-2">
                    <button
                      onClick={() => copyToClipboard(`<t:${unix}:${f.label}>`)}
                      className="text-xs text-blue-400 hover:text-blue-200 border border-blue-500 px-2 py-1 rounded"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-900">
                <td className="border px-3 py-2 text-green-300 font-mono">{unix}</td>
                <td className="border px-3 py-2" colSpan={3}>
                  Raw Unix timestamp
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-xl text-center text-white bg-[rgba(20,25,40,0.75)] border border-gray-700 rounded p-4 shadow">
          ⏳ <span className="font-semibold text-white">Selected Timestamp in <span className="text-blue-300">EVE Time (UTC)</span>:</span> <span className="text-green-300 font-bold">{eveFuture}</span>
        </div>
        {copiedText && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity">
            Copied <span className="font-mono">{copiedText}</span> to clipboard ✅
          </div>
        )}
      </div>
    </div>
  );
}