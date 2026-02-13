export const AUDIOBOOK = {
  title: "Poker's Number 1",
  author: "",
  audioUrl:
    "https://pokersnumber1.blob.core.windows.net/audiobook/poker1.m4b?sp=r&st=2026-02-13T12:28:08Z&se=2027-02-13T20:43:08Z&spr=https&sv=2024-11-04&sr=b&sig=60kgqurd95h2XilJRIi3yvl1U%2FEzDMLoaIlIFYttMrg%3D",
  artUrl:
    "https://pokersnumber1.blob.core.windows.net/audiobook/albumart.jpeg?sp=r&st=2026-02-13T12:30:21Z&se=2027-02-13T20:45:21Z&spr=https&sv=2024-11-04&sr=b&sig=03dlmHTbAM7CMYhUKwz%2Fl%2BCKRz1rZPac7%2FdJfuhh94w%3D"
} as const;

export type Chapter = { title: string; startSeconds: number };

// If your .m4b has embedded chapters, browsers don’t expose them reliably.
// Edit these as needed.
export const CHAPTERS: Chapter[] = [
  { title: "Start", startSeconds: 0 }
];

