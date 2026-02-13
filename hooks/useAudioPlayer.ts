"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "@/lib/time";

type PersistedState = {
  v: 1;
  t: number; // seconds
  r: number; // rate
  updatedAt: number;
};

const STORAGE_KEY = "audiobook-player:v1";

export function useAudioPlayer(opts: {
  src: string;
  initialRate?: number;
  persist?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [bufferedSeconds, setBufferedSeconds] = useState(0);
  const [rate, setRate] = useState(opts.initialRate ?? 1);
  const [error, setError] = useState<string | null>(null);
  const lastPersistRef = useRef<number>(0);
  const PERSIST_INTERVAL_MS = 2000;

  const [hasResume, setHasResume] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [resumeRate, setResumeRate] = useState(rate);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return clamp(time / duration, 0, 1);
  }, [time, duration]);

  const remaining = Math.max(0, duration - time);

  const persistEnabled = opts.persist ?? true;

  const writePersisted = useCallback(
    (t: number, r: number) => {
      if (!persistEnabled) return;
      try {
        const payload: PersistedState = { v: 1, t, r, updatedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
    },
    [persistEnabled]
  );

  useEffect(() => {
    if (!persistEnabled) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed?.v !== 1) return;
      if (!Number.isFinite(parsed.t) || !Number.isFinite(parsed.r)) return;
      const t = Math.max(0, parsed.t);
      const r = clamp(parsed.r, 0.5, 3);

      // Don't show toast for near-zero.
      if (t > 5) {
        setHasResume(true);
        setResumeTime(t);
        setResumeRate(r);
      }
      setRate(r);
    } catch {
      // ignore
    }
  }, [persistEnabled]);

  const bindAudio = useCallback((node: HTMLAudioElement | null) => {
    audioRef.current = node;
  }, []);

  const play = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      await a.play();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Playback failed");
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void play();
    else pause();
  }, [pause, play]);

  const seek = useCallback((nextTimeSeconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    const d = Number.isFinite(a.duration) ? a.duration : duration;
    const t = clamp(nextTimeSeconds, 0, d || Number.MAX_SAFE_INTEGER);
    a.currentTime = t;
    setTime(t);
  }, [duration]);

  const skipBy = useCallback(
    (deltaSeconds: number) => {
      seek(time + deltaSeconds);
    },
    [seek, time]
  );

  const setPlaybackRate = useCallback(
    (nextRate: number) => {
      const a = audioRef.current;
      const r = clamp(nextRate, 0.5, 3);
      if (a) a.playbackRate = r;
      setRate(r);
      writePersisted(time, r);
    },
    [time, writePersisted]
  );

  const applyResume = useCallback(
    async (autoplay: boolean) => {
      const a = audioRef.current;
      if (!a) return;
      try {
        a.playbackRate = resumeRate;
        setRate(resumeRate);
        a.currentTime = resumeTime;
        setTime(resumeTime);
        setHasResume(false);
        writePersisted(resumeTime, resumeRate);
        if (autoplay) await a.play();
      } catch {
        // ignore
      }
    },
    [resumeRate, resumeTime, writePersisted]
  );

  const clearResume = useCallback(() => {
    setHasResume(false);
    setResumeTime(0);
    setResumeRate(rate);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [rate]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    // Set source + hint the type; most browsers treat .m4b as audio/mp4
    a.src = opts.src;
    a.preload = "metadata";
    // iOS Safari: keep playback inline (attribute-based for audio)
    a.setAttribute("playsinline", "true");
    a.setAttribute("webkit-playsinline", "true");
    a.playbackRate = rate;

    const onLoaded = () => {
      setReady(true);
      setDuration(Number.isFinite(a.duration) ? a.duration : 0);
      setError(null);
    };
    const onDuration = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    const onTime = () => {
      const t = a.currentTime || 0;
      setTime(t);
      const now = Date.now();
      if (now - lastPersistRef.current >= PERSIST_INTERVAL_MS) {
        lastPersistRef.current = now;
        writePersisted(t, a.playbackRate || rate);
      }
    };
    const onProgress = () => {
      const buf = a.buffered;
      if (buf.length) {
        const end = buf.end(buf.length - 1);
        setBufferedSeconds(Number.isFinite(end) ? end : 0);
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      writePersisted(a.currentTime || 0, a.playbackRate || rate);
    };
    const onError = () => setError("Audio failed to load or play.");

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("durationchange", onDuration);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("progress", onProgress);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onError);

    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("durationchange", onDuration);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("progress", onProgress);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onError);
    };
  }, [opts.src, rate, writePersisted]);

  return {
    audioRef,
    bindAudio,
    ready,
    playing,
    duration,
    time,
    bufferedSeconds,
    remaining,
    progress,
    rate,
    error,
    play,
    pause,
    toggle,
    seek,
    skipBy,
    setPlaybackRate,
    hasResume,
    resumeTime,
    applyResume,
    clearResume
  };
}

