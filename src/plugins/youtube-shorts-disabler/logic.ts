export const STYLE_ID = 'braveinn-yt-shorts-style';

const SHORTS_CSS = `
ytd-rich-shelf-renderer[is-shorts],
ytd-reel-shelf-renderer,
ytd-guide-entry-renderer:has(a[title="Shorts"]),
ytd-mini-guide-entry-renderer:has(a[title="Shorts"]),
ytd-video-renderer:has(a[href*="/shorts/"]),
ytd-grid-video-renderer:has(a[href*="/shorts/"]) {
  display: none !important;
}
`.trim();

export function injectShortsBlocker(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = SHORTS_CSS;
  (document.head ?? document.documentElement).appendChild(style);
}

export function removeShortsBlocker(): void {
  document.getElementById(STYLE_ID)?.remove();
}

export function shouldRedirect(pathname: string): boolean {
  return pathname.startsWith('/shorts/');
}

export function extractVideoId(pathname: string): string | null {
  const match = pathname.match(/^\/shorts\/([^/?#]+)/);
  return match?.[1] ?? null;
}
