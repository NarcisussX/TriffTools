import React from "react";
import { useBg } from "./BgContext"; // Import the context hook

export default function Layout({ children }: { children: React.ReactNode }) {
  const { animated } = useBg(); // Get animated from context

  return (
    <div className="relative min-h-screen bg-[#1e1f29] text-gray-100 font-mono overflow-hidden">
      {/* Starfield background */}
      <div
        className={
          "absolute inset-0 z-0 pointer-events-none " +
          (animated ? "animate-starfield" : "static-starfield")
        }
      />
      {/* Top & bottom gradients */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400/20 to-transparent z-10" />
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-blue-400/20 to-transparent z-10" />

      {/* No toggle button here! (moved to navbar/settings dropdown) */}

      {/* Actual page contents */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
