// App.tsx
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Settings } from "lucide-react";
import { useBg } from "./BgContext"; 

import Landing from "./pages/Landing";
import GasCalc from "./pages/GasCalc";
import BlootCalc from "./pages/blootCalc";
import PiCalc from "./pages/piCalc";
import RollingMass from "./pages/RollingMass";
import WormholeSites from "./pages/WormholeSites";
import Acknowledgements from "./pages/acknowledgements";
import Changelog from "./pages/changelog";
import Roadmap from "./pages/roadmap";
import OreCalculator from "./pages/OreCalculator";
import TimestampTool from "./pages/Timestamp";
import WormholeDatabase from "./pages/WormholeDatabase";
import ReactionCalc from "./pages/ReactionCalc";
import ParticipationCalc from "./pages/ParticipationCalc";

const navItems = [
  { to: "/gas-calc", label: "Gas Calculator" },
  { to: "/ore", label: "Ore Calculator" },
  { to: "/participation", label: "Participation Calculator" },
  { to: "/bloot", label: "Ratting Split Calc" },
  { to: "/pi-calc", label: "PI Profitability" },
  { to: "/rolling-mass", label: "Rolling Mass" },
  { to: "/wormhole-sites", label: "Wormhole PvE Sites" },
  { to: "/timestamp", label: "Time Converter" },
  { to: "/wormholes", label: "Wormhole Database"},
  { to: "/reaction-calc", label: "Reactions Calculator" },
  { to: "/acknowledgements", label: "Acknowledgements" },
  { to: "/changelog", label: "Changelog" },
  { to: "/roadmap", label: "Roadmap" },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { animated, setAnimated } = useBg();
  const [showDropdown, setShowDropdown] = useState(false);
  const [playersOnline, setPlayersOnline] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("https://esi.evetech.net/latest/status/?datasource=tranquility");
        const data = await res.json();
        setPlayersOnline(data.players);
      } catch {
        setPlayersOnline(null);
      }
    };
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close menu when route changes
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen text-white font-sans bg-background">
      <header className="bg-accent shadow-md z-50 relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-2xl font-bold tracking-wide text-white hover:text-highlight transition-colors"
            >
              Triff.Tools
            </Link>
            {/* Settings Icon */}
            <div className="relative">
              <button
                className="ml-0 mt-[3px] p-1 rounded-full hover:bg-accent/70 focus:outline-none"
                onClick={() => setShowDropdown((d) => !d)}
                aria-label="Open settings"
              >
                <Settings size={20} />
              </button>
              {showDropdown && (
                <div className="absolute left-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg min-w-[180px] z-50 p-2">
                  <button
                    className="block w-full text-left px-2 py-1 rounded hover:bg-accent"
                    onClick={() => {
                      setAnimated((a) => !a);
                      setShowDropdown(false);
                    }}
                  >
                    {animated ? "Switch to Static BG" : "Switch to Animated BG"}
                  </button>
                </div>
              )}
            </div>
          </div>
<div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs sm:text-sm text-blue-300 pointer-events-none select-none">
          <span className="text-sm text-blue-400 font-mono">
            {playersOnline !== null ? `TQ: ${playersOnline.toLocaleString()} online` : "🛰️ Connecting..."}
          </span>
        </div>
          {/* Burger icon always visible */}
          <button
            className="text-white z-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Right drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-gray-900 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-4 space-y-4">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-white py-2 px-4 rounded hover:bg-accent hover:text-highlight transition ${
                  location.pathname === to ? "text-highlight underline" : ""
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Overlay when menu is open */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/gas-calc" element={<GasCalc />} />
          <Route path="/bloot" element={<BlootCalc />} />
          <Route path="/pi-calc" element={<PiCalc />} />
          <Route path="/rolling-mass" element={<RollingMass />} />
          <Route path="/wormhole-sites" element={<WormholeSites />} />
          <Route path="/acknowledgements" element={<Acknowledgements />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/ore" element={<OreCalculator />} />
          <Route path="/timestamp" element={<TimestampTool />} />
          <Route path="/wormholes" element={<WormholeDatabase />} />
          <Route path="/reaction-calc" element={<ReactionCalc />} />
          <Route path="/participation" element={<ParticipationCalc />} />
        </Routes>
      </main>
    </div>
  );
}
