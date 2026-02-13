"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ListMusic, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { Chapter } from "@/lib/media";
import { formatTime } from "@/lib/time";

export function ChapterDrawer(props: {
  chapters: Chapter[];
  chaptersLoading?: boolean;
  currentTimeSeconds: number;
  onSelectChapter: (startSeconds: number) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const activeIndex = useMemo(() => {
    const t = props.currentTimeSeconds;
    let idx = 0;
    for (let i = 0; i < props.chapters.length; i++) {
      if (props.chapters[i]!.startSeconds <= t) idx = i;
    }
    return idx;
  }, [props.chapters, props.currentTimeSeconds]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 backdrop-blur-xl hover:bg-white/15",
          props.className
        )}
      >
        <ListMusic className="h-4 w-4" />
        Chapters
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              aria-label="Close"
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md px-3 pb-[max(env(safe-area-inset-bottom),12px)]"
              initial={{ y: 520 }}
              animate={{ y: 0 }}
              exit={{ y: 520 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <div className="rounded-3xl bg-[rgba(0,0,0,0.70)] shadow-glow ring-1 ring-white/10 backdrop-blur-2xl">
                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Chapters</p>
                    <p className="text-xs text-white/60">Tap a chapter to jump.</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-white/10 p-2 text-white hover:bg-white/15"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[55vh] overflow-auto px-2 pb-3">
                  {props.chaptersLoading ? (
                    <p className="py-6 text-center text-sm text-white/60">Loading chapters…</p>
                  ) : (
                  props.chapters.map((c, i) => {
                    const active = i === activeIndex;
                    return (
                      <button
                        key={`${c.title}-${c.startSeconds}`}
                        onClick={() => {
                          props.onSelectChapter(c.startSeconds);
                          setOpen(false);
                        }}
                        className={cn(
                          "mb-1 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left hover:bg-white/10",
                          active && "bg-white text-black hover:bg-white"
                        )}
                      >
                        <div className="min-w-0">
                          <p className={cn("truncate text-sm font-semibold", active ? "text-black" : "text-white")}>
                            {c.title}
                          </p>
                          <p className={cn("text-xs tabular-nums", active ? "text-black/70" : "text-white/60")}>
                            {formatTime(c.startSeconds)}
                          </p>
                        </div>
                        {active ? (
                          <span className="rounded-full bg-black/10 px-2 py-1 text-xs font-semibold text-black">
                            Current
                          </span>
                        ) : null}
                      </button>
                    );
                  })
                  )}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

