import { Readable } from "node:stream";
import { parseStream } from "music-metadata";
import { AUDIOBOOK } from "@/lib/media";
import type { Chapter } from "@/lib/media";

export const dynamic = "force-dynamic";
export const revalidate = 0;
/** Allow time to stream and parse large M4B for chapter list (Vercel caps by plan: 10s Hobby, 60s+ Pro) */
export const maxDuration = 60;

export async function GET() {
  try {
    const res = await fetch(AUDIOBOOK.audioUrl, {
      headers: { "Accept": "audio/mp4,audio/*,*/*" },
      cache: "no-store",
    });
    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch audio", status: res.status },
        { status: 502 }
      );
    }
    const body = res.body;
    if (!body) {
      return Response.json(
        { error: "No response body" },
        { status: 502 }
      );
    }
    // Cast: fetch() body is DOM ReadableStream; Node Readable.fromWeb expects stream/web type
    const stream = Readable.fromWeb(body as any);
    const metadata = await parseStream(stream, undefined, {
      includeChapters: true,
      skipCovers: true,
    });

    const raw = metadata.format?.chapters ?? [];
    const chapters: Chapter[] = raw.map((ch) => ({
      title: ch.title ?? "Chapter",
      startSeconds: Number.isFinite(ch.start) ? Math.max(0, ch.start) : 0,
    }));

    // Sort by start time and dedupe by start (keep first title)
    const byStart = new Map<number, string>();
    for (const ch of chapters) {
      const t = Math.floor(ch.startSeconds);
      if (!byStart.has(t)) byStart.set(t, ch.title);
    }
    const sorted: Chapter[] = Array.from(byStart.entries())
      .sort(([a], [b]) => a - b)
      .map(([startSeconds, title]) => ({ title, startSeconds }));

    if (sorted.length === 0) {
      sorted.push({ title: "Start", startSeconds: 0 });
    }

    return Response.json({ chapters: sorted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json(
      { error: "Chapter extraction failed", detail: message },
      { status: 500 }
    );
  }
}
