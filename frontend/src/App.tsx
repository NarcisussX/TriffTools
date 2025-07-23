import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Landing from "./pages/Landing";
import GasCalc from "./pages/GasCalc";
import BlootCalc from './pages/blootCalc';
import PiCalc from "./pages/piCalc";
import RollingMass from "./pages/RollingMass";
import WormholeSites from "./pages/WormholeSites";
import Acknowledgements from "./pages/acknowledgements";
import { Menu, X } from "lucide-react";
import Changelog from "./pages/changelog";
import Roadmap from "./pages/roadmap";
import { Settings } from "lucide-react";
import { useBg } from "./BgContext"; 

const navItems = [
  { to: "/gas-calc", label: "Gas Calculator" },
  { to: "/bloot", label: "Ratting Split Calc" },
  { to: "/pi-calc", label: "PIP-C" },
  { to: "/rolling-mass", label: "Rolling Mass" },
  { to: "/wormhole-sites", label: "Wormhole PvE Sites" },
  { to: "/acknowledgements", label: "Acknowledgements" },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { animated, setAnimated } = useBg();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative-min-h-screen text-white font-sans">
      <header className="bg-accent shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-2xl font-bold tracking-wide text-white hover:text-highlight transition-colors"
            >
              Triff.Tools
            </Link>
            {/* Settings icon */}
            <div className="relative">
              <button
                className="ml-0 mt-[3px] p-1 rounded-full hover:bg-accent/70 focus:outline-none"
                onClick={() => setShowDropdown((d) => !d)}
                aria-label="Open settings"
              >
                <Settings size={20} />
              </button>
              {/* Dropdown */}
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
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`hover:text-highlight transition-colors ${
                  location.pathname === to ? "text-highlight underline" : ""
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-primary border-t border-gray-700 px-4 py-2 space-y-2">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block text-sm py-1 px-2 rounded hover:bg-accent hover:text-highlight transition ${
                  location.pathname === to ? "text-highlight underline" : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
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
        </Routes>
      </main>
    </div>
  );
}
