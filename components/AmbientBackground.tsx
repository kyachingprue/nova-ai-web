"use client";

import { useMemo } from "react";

export default function AmbientBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 4,
      })),
    []
  );

  return (
    <div className="ambient fixed inset-0 -z-10 overflow-hidden">
      <span className="a1" />
      <span className="a2" />
      <span className="a3" />
      <div className="absolute inset-0">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
