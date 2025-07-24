import React from "react";

export default function Roadmap() {
  return (
    <div className="font-mono">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-white">Roadmap</h1>

        <div className="space-y-6 text-base text-gray-300">
          <p>
            What's next?
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-white font-semibold">Hybrid reactions (all reactions?) calculator</span> 
            </li>
            <li>
              <span className="text-white font-semibold">Video, text and image guides</span>
            </li>
            <li>
              <span className="text-white font-semibold">UI/UX Cleanup</span> 
            </li>
            <li>
              <span className="text-white font-semibold">Temporary: localStorage saving huffing fleet comps</span> - Suggested by Absurdly
            </li>
            <li>
              <span className="text-white font-semibold">ESI account linking for permanent storage of settings</span> - Stretch Goal
            </li>
            <li>
              <span className="text-white font-semibold">Industry Calculator</span> - Stretch Goal
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
