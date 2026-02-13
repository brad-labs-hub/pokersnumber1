"use client";

import { AUDIOBOOK } from "@/lib/media";

export function BackgroundGlow() {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-black"
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 opacity-80"
        style={{
          backgroundImage: `url("${AUDIOBOOK.artUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(36px) saturate(1.15)",
          transform: "scale(1.12)"
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 20%, rgba(0,0,0,0.10), rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.92))"
        }}
      />
    </>
  );
}

