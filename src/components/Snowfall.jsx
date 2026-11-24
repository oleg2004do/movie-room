import React from 'react';

const flakes = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${(i * 3.3) % 100}%`,
  size: `${10 + (i % 4) * 4}px`,
  duration: `${7 + (i % 6) * 2}s`,
  delay: `${-(i % 7) * 1.5}s`,
  opacity: 0.35 + (i % 5) * 0.12,
}));

export default function Snowfall() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none"
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          style={{
            left: flake.left,
            fontSize: flake.size,
            opacity: flake.opacity,
            animation: `snowfall ${flake.duration} linear ${flake.delay} infinite`,
          }}
          className="fixed -top-8 text-white drop-shadow"
        >
          ❄
        </span>
      ))}
    </div>
  );
}