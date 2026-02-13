"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatTime } from "@/lib/time";

export function ResumeToast(props: {
  open: boolean;
  resumeAtSeconds: number;
  onResume: () => void;
  onStartOver: () => void;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {props.open ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="fixed left-3 right-3 top-3 z-50 mx-auto max-w-md"
        >
          <div className="rounded-2xl bg-[rgba(0,0,0,0.60)] px-4 py-3 shadow-glow ring-1 ring-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/90">
                  Resume at <span className="text-white">{formatTime(props.resumeAtSeconds)}</span>
                </p>
                <p className="text-xs text-white/60">We saved your place and playback speed.</p>
              </div>
              <button
                onClick={props.onDismiss}
                className="shrink-0 rounded-full px-2 py-1 text-xs text-white/70 hover:text-white"
              >
                Dismiss
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={props.onStartOver}
                className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Start over
              </button>
              <button
                onClick={props.onResume}
                className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                Resume
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

