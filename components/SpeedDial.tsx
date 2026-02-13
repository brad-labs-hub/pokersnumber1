"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const RATES = [0.75, 1, 1.25, 1.5, 2] as const;

export function SpeedDial(props: {
  value: number;
  onChange: (next: number) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    const rounded = Math.round(props.value * 100) / 100;
    return `${rounded.toFixed(rounded % 1 === 0 ? 0 : 2)}x`;
  }, [props.value]);

  return (
    <div className={cn("relative", props.className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 backdrop-blur-xl hover:bg-white/15"
      >
        <span className="tabular-nums">{label}</span>
        <ChevronUp className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="absolute bottom-full left-0 mb-2 w-40 overflow-hidden rounded-2xl bg-[rgba(0,0,0,0.65)] shadow-glow ring-1 ring-white/10 backdrop-blur-xl"
          >
            <div className="p-1">
              {RATES.map((r) => {
                const active = Math.abs(r - props.value) < 0.001;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      props.onChange(r);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10",
                      active && "bg-white text-black hover:bg-white"
                    )}
                  >
                    <span className="tabular-nums font-semibold">{r}x</span>
                    {active ? <span className="text-xs font-semibold">Current</span> : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

