"use client";

import Image from "next/image";
import { Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CHAPTERS, AUDIOBOOK } from "@/lib/media";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/time";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { SeekBar } from "@/components/SeekBar";
import { SpeedDial } from "@/components/SpeedDial";
import { ChapterDrawer } from "@/components/ChapterDrawer";
import { ResumeToast } from "@/components/ResumeToast";

export function AudioPlayer() {
  const player = useAudioPlayer({ src: AUDIOBOOK.audioUrl, persist: true, initialRate: 1 });
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (!player.hasResume) return;
    setToastOpen(true);
    const t = window.setTimeout(() => setToastOpen(false), 9000);
    return () => window.clearTimeout(t);
  }, [player.hasResume]);

  const title = AUDIOBOOK.title;
  const subtitle = AUDIOBOOK.author ? AUDIOBOOK.author : "Audiobook";

  const primaryIcon = player.playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />;

  const currentChapter = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i]!.startSeconds <= player.time) idx = i;
    }
    return CHAPTERS[idx];
  }, [player.time]);

  return (
    <div className="relative mx-auto flex min-h-[100svh] max-w-md flex-col px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),18px)]">
      <ResumeToast
        open={toastOpen && player.hasResume}
        resumeAtSeconds={player.resumeTime}
        onDismiss={() => setToastOpen(false)}
        onStartOver={() => {
          player.clearResume();
          player.seek(0);
          setToastOpen(false);
        }}
        onResume={() => {
          void player.applyResume(true);
          setToastOpen(false);
        }}
      />

      <header className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-white/60">Now Playing</p>
          <h1 className="truncate text-lg font-semibold text-white">{title}</h1>
          <p className="truncate text-sm text-white/70">{subtitle}</p>
          {currentChapter ? (
            <p className="mt-1 truncate text-xs text-white/55">
              Chapter: <span className="text-white/80">{currentChapter.title}</span>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SpeedDial value={player.rate} onChange={(r) => player.setPlaybackRate(r)} />
          <ChapterDrawer
            chapters={CHAPTERS}
            currentTimeSeconds={player.time}
            onSelectChapter={(s) => {
              player.seek(s);
              void player.play();
            }}
          />
        </div>
      </header>

      <main className="mt-6 flex flex-1 flex-col justify-center">
        <div className="mx-auto w-full">
          <div className="mx-auto w-[78%] max-w-[340px]">
            <div className="relative aspect-square overflow-hidden rounded-[28px] shadow-glow ring-1 ring-white/10">
              <Image
                src={AUDIOBOOK.artUrl}
                alt="Album art"
                fill
                priority
                sizes="(max-width: 768px) 70vw, 340px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-surface-1 p-4 shadow-glow ring-1 ring-white/10 backdrop-blur-2xl">
            <SeekBar
              valueSeconds={player.time}
              durationSeconds={player.duration}
              bufferedSeconds={player.bufferedSeconds}
              onSeek={(s) => player.seek(s)}
            />

            <div className="mt-4 grid grid-cols-3 items-center gap-3">
              <button
                onClick={() => player.skipBy(-15)}
                className="flex items-center justify-center rounded-2xl bg-white/10 py-3 text-white ring-1 ring-white/10 hover:bg-white/15"
                aria-label="Back 15 seconds"
              >
                <div className="relative">
                  <RotateCcw className="h-6 w-6" />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-white/80">
                    15
                  </span>
                </div>
              </button>

              <button
                onClick={() => player.toggle()}
                className={cn(
                  "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-glow ring-1 ring-white/30",
                  "active:scale-[0.98]"
                )}
                aria-label={player.playing ? "Pause" : "Play"}
              >
                {primaryIcon}
              </button>

              <button
                onClick={() => player.skipBy(30)}
                className="flex items-center justify-center rounded-2xl bg-white/10 py-3 text-white ring-1 ring-white/10 hover:bg-white/15"
                aria-label="Forward 30 seconds"
              >
                <div className="relative">
                  <RotateCw className="h-6 w-6" />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-white/80">
                    30
                  </span>
                </div>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span>Single-stream (.m4b)</span>
              </div>
              <span className="tabular-nums">
                {player.duration ? formatTime(player.duration) : player.ready ? "—" : "Loading…"}
              </span>
            </div>

            {player.error ? (
              <div className="mt-3 rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-500/20">
                {player.error} If this is iOS Safari, confirm the file is served as <code>audio/mp4</code>.
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <audio ref={player.bindAudio} />
    </div>
  );
}

