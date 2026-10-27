"use client";

import { useMemo } from "react";

export default function NovaBurst() {
  const particles = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        radius: 70 + i * 22,
        duration: 8 + i * 3,
        delay: i * 0.6,
      })),
    []
  );

  return (
    <div
      className="relative aspect-square flex items-center justify-center animate-[fadeUp_0.9s_0.2s_ease-out_both] max-w-[340px] lg:max-w-none mx-auto lg:mx-0 order-[-1] lg:order-none"
      aria-hidden="true"
    >
      <div className="ring ring3" />
      <div className="ring ring2" />
      <div className="ring ring1" />
      <div className="core" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            // @ts-expect-error -- custom property used by the orbit keyframe
            "--r": `${p.radius}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
