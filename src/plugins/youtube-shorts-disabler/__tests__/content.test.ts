import { describe, it, expect, beforeEach, vi } from 'vitest';

// Must be stubbed before importing logic (which accesses document at module scope via side effects)
vi.stubGlobal('chrome', {
  storage: { local: { get: vi.fn().mockResolvedValue({}) } },
  runtime: { onMessage: { addListener: vi.fn() }, id: 'test' },
});

const { injectShortsBlocker, removeShortsBlocker, shouldRedirect, extractVideoId, STYLE_ID } =
  await import('../logic');

describe('injectShortsBlocker', () => {
  beforeEach(() => {
    document.getElementById(STYLE_ID)?.remove();
  });

  it('injects a <style> element', () => {
    injectShortsBlocker();
    expect(document.getElementById(STYLE_ID)).toBeTruthy();
  });

  it('does not duplicate the style element on repeated calls', () => {
    injectShortsBlocker();
    injectShortsBlocker();
    expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
  });
});

describe('removeShortsBlocker', () => {
  it('removes the injected style', () => {
    injectShortsBlocker();
    removeShortsBlocker();
    expect(document.getElementById(STYLE_ID)).toBeNull();
  });

  it('is safe to call when no style exists', () => {
    expect(() => removeShortsBlocker()).not.toThrow();
  });
});

describe('shouldRedirect', () => {
  it('returns true for /shorts/ paths', () => {
    expect(shouldRedirect('/shorts/dQw4w9WgXcQ')).toBe(true);
  });

  it('returns false for /watch paths', () => {
    expect(shouldRedirect('/watch?v=dQw4w9WgXcQ')).toBe(false);
  });

  it('returns false for the root', () => {
    expect(shouldRedirect('/')).toBe(false);
  });
});

describe('extractVideoId', () => {
  it('extracts the video ID', () => {
    expect(extractVideoId('/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('strips query params', () => {
    expect(extractVideoId('/shorts/dQw4w9WgXcQ?si=abc123')).toBe('dQw4w9WgXcQ');
  });

  it('strips hash fragments', () => {
    expect(extractVideoId('/shorts/dQw4w9WgXcQ#t=10')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for non-shorts paths', () => {
    expect(extractVideoId('/watch?v=dQw4w9WgXcQ')).toBeNull();
  });
});
