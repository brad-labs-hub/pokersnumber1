"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { clamp, formatTime } from "@/lib/time";

export function SeekBar(props: {
  valueSeconds: number;
  durationSeconds: number;
  bufferedSeconds?: number;
  onSeek: (nextSeconds: number) => void;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState<number | null>(null);

  const safeDuration = props.durationSeconds > 0 ? props.durationSeconds : 0;

  const effectiveValue = dragValue ?? props.valueSeconds;
  const pct = useMemo(() => {
    if (!safeDuration) return 0;
    return clamp(effectiveValue / safeDuration, 0, 1);
  }, [effectiveValue, safeDuration]);

  const bufferedPct = useMemo(() => {
    if (!safeDuration) return 0;
    const b = props.bufferedSeconds ?? 0;
    return clamp(b / safeDuration, 0, 1);
  }, [props.bufferedSeconds, safeDuration]);

  function secondsFromClientX(clientX: number) {
    const el = wrapRef.current;
    if (!el || !safeDuration) return 0;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const ratio = rect.width ? x / rect.width : 0;
    return ratio * safeDuration;
  }

  return (
    <div className={cn("w-full", props.className)}>
      <div className="mb-2 flex items-baseline justify-between text-xs text-white/70">
        <span className="tabular-nums">{formatTime(effectiveValue)}</span>
        <span className="tabular-nums">-{formatTime(Math.max(0, safeDuration - effectiveValue))}</span>
      </div>

      <div
        ref={wrapRef}
        className={cn(
          "relative h-4 w-full select-none rounded-full bg-white/10 ring-1 ring-white/10",
          dragging && "ring-2 ring-white/30"
        )}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          setDragging(true);
          const s = secondsFromClientX(e.clientX);
          setDragValue(s);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          const s = secondsFromClientX(e.clientX);
          setDragValue(s);
        }}
        onPointerUp={(e) => {
          if (!dragging) return;
          const s = secondsFromClientX(e.clientX);
          setDragging(false);
          setDragValue(null);
          props.onSeek(s);
        }}
        onPointerCancel={() => {
          setDragging(false);
          setDragValue(null);
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden rounded-full"
        >
          <div
            className="absolute left-0 top-0 h-full bg-white/15"
            style={{ width: `${bufferedPct * 100}%` }}
          />
          <div
            className="absolute left-0 top-0 h-full bg-white"
            style={{ width: `${pct * 100}%` }}
          />
        </div>

        <div
          aria-hidden
          className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow-glow"
          style={{ left: `calc(${pct * 100}% - 12px)` }}
        />
      </div>
    </div>
  );
}

