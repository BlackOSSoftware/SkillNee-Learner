'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, VideoOff } from 'lucide-react';
import { usePlaybackAuth, useRenewPlaybackToken } from '@/hooks/learning/use-learning';
import { normalizeApiError } from '@/lib/api-error';
import { env } from '@/lib/env';
import { SecureVideoPlayer } from '@/components/learning/secure-video-player';
import type { LearningLesson } from '@/types/learning';

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** `expiresIn` follows jsonwebtoken notation ("10m", "900s", "1h" or plain seconds). */
function durationMs(value: string | number): number {
  if (typeof value === 'number') return value * 1000;
  const m = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)?$/i.exec(value.trim());
  if (!m) return 5 * 60_000;
  const n = Number(m[1]);
  const unit = (m[2] ?? 's').toLowerCase();
  return n * ({ ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 1000);
}

/** Convert common provider URLs (YouTube, Vimeo) into embeddable iframe URLs. */
function toEmbedUrl(rawUrl: string, provider?: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, '');
  const p = (provider || '').toLowerCase();

  if (p === 'youtube' || host === 'youtube.com' || host === 'youtu.be') {
    let id: string | null = null;
    if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
    else if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const m = /^\/(embed|shorts|live)\/([^/?]+)/.exec(url.pathname);
      if (m) id = m[2];
    }
    return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
  }

  if (p === 'vimeo' || host === 'vimeo.com') {
    const m = /^\/(\d+)/.exec(url.pathname);
    return m ? `https://player.vimeo.com/video/${m[1]}` : null;
  }

  return null;
}

/** Renew a little before expiry so a Range request never carries a dead token. */
const RENEW_MARGIN_MS = 45_000;

/**
 * Protected video player. Requests a short-lived playback token from the
 * backend, then streams via /learning/lessons/:id/video/stream?token=…
 * Uses the same custom SecureVideoPlayer as the admin preview: no native
 * download menu, picture-in-picture, remote playback or context menu.
 * The token lives only in React Query memory — never persisted.
 *
 * Recovery: on a media error or when the token is about to expire, the player
 * re-authorizes (POST /playback-token), swaps the stream URL and resumes at the
 * saved playback position. One automatic recovery per failure; a second
 * immediate failure surfaces the error state.
 */
export function LessonPlayer({ lesson }: { lesson: LearningLesson }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const [authExpiresAt, setAuthExpiresAt] = useState<number | null>(null);
  const recovering = useRef(false);
  const lastRecovery = useRef(0);

  const isVideo = lesson.type === 'video';
  const hasVideo = Boolean(lesson.content?.video);
  const playback = usePlaybackAuth(isVideo && hasVideo ? lesson.id : null, isVideo && hasVideo);
  const renew = useRenewPlaybackToken();

  const auth = playback.data;
  const streamUrl = useMemo(() => {
    if (!auth || auth.type !== 'uploaded' || !auth.playbackToken) return null;
    return `${env.apiBaseUrl}/learning/lessons/${encodeURIComponent(lesson.id)}/video/stream?token=${encodeURIComponent(auth.playbackToken)}`;
  }, [auth, lesson.id]);

  // Track token expiry whenever a fresh authorization arrives.
  useEffect(() => {
    if (auth && auth.type === 'uploaded') {
      setAuthExpiresAt(Date.now() + durationMs(auth.expiresIn));
    }
  }, [auth]);

  const externalUrl = auth?.type === 'external' ? auth.externalUrl : lesson.content?.video?.externalUrl;

  // Reset the error state when the stream URL changes (render-time adjustment).
  const [prevStreamUrl, setPrevStreamUrl] = useState(streamUrl);
  if (prevStreamUrl !== streamUrl) {
    setPrevStreamUrl(streamUrl);
    setVideoError(false);
  }

  /** Re-authorize and resume at the current position. Safe to call repeatedly; guarded. */
  async function recover() {
    if (recovering.current) return;
    recovering.current = true;
    setResumeAt(videoRef.current?.currentTime ?? null);
    try {
      await renew.mutateAsync(lesson.id);
      // New playbackToken → new streamUrl → SecureVideoPlayer remounts → seeks to startAt.
    } catch {
      setVideoError(true);
    } finally {
      recovering.current = false;
    }
  }

  /** Renew before expiry when the user interacts with the player. */
  function maybeRenew() {
    if (!authExpiresAt) return;
    if (Date.now() > authExpiresAt - RENEW_MARGIN_MS) void recover();
  }

  /** Temporary diagnostics — remove once confirmed. Never logs the JWT. */
  function logVideoError() {
    const v = videoRef.current;
    const err = v?.error;
    console.warn('[lesson-player] video error', {
      lessonId: lesson.id,
      networkState: v?.networkState ?? null,
      readyState: v?.readyState ?? null,
      errorCode: err?.code ?? null,
      errorMessage: err?.message ?? null,
    });
  }

  if (!isVideo) return null;

  if (!hasVideo) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-line bg-surface-2">
        <div className="text-center">
          <VideoOff className="mx-auto size-8 text-ink-subtle" aria-hidden />
          <p className="mt-2 text-sm text-ink-muted">No video attached to this lesson.</p>
        </div>
      </div>
    );
  }

  if (playback.isPending) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-line bg-black/90">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Authorizing playback…
        </div>
      </div>
    );
  }

  if (playback.isError || !auth) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface-2 p-6 text-center">
        <AlertCircle className="size-8 text-danger" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-ink">Playback unavailable</p>
          <p className="mt-1 text-xs text-ink-muted">
            {playback.error
              ? normalizeApiError(playback.error).message
              : 'Could not authorize playback.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => playback.refetch()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
        >
          <RefreshCw className="size-4" aria-hidden />
          Retry
        </button>
      </div>
    );
  }

  if (auth.type === 'external' && externalUrl) {
    const embedUrl = toEmbedUrl(externalUrl, lesson.content?.video?.provider);
    const provider = lesson.content?.video?.provider || 'external provider';
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-black shadow-card">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${lesson.title} — ${provider}`}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Watch on {provider}
            </a>
          </div>
        )}
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-line bg-surface-2">
        <p className="text-sm text-ink-muted">Video source unavailable.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-black shadow-card">
        {videoError ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
            <AlertCircle className="size-8 text-danger" aria-hidden />
            <p className="text-sm font-medium text-white">Video failed to load</p>
            <button
              type="button"
              onClick={() => {
                setVideoError(false);
                void recover();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              <RefreshCw className="size-4" aria-hidden />
              Retry playback
            </button>
          </div>
        ) : null}
        <SecureVideoPlayer
          src={streamUrl}
          videoRef={videoRef}
          startAt={resumeAt}
          onResumed={() => setResumeAt(null)}
          onIntent={maybeRenew}
          onPlaying={() => {
            lastRecovery.current = 0;
          }}
          onMediaError={() => {
            logVideoError();
            // One automatic recovery per failure; a second failure right after shows the error state.
            if (recovering.current) {
              setVideoError(true);
              return;
            }
            if (Date.now() - lastRecovery.current < 20_000) {
              setVideoError(true);
              return;
            }
            lastRecovery.current = Date.now();
            void recover();
          }}
        />
        {lesson.durationSeconds ? (
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            {formatDuration(lesson.durationSeconds)}
          </span>
        ) : null}
      </div>
      {renew.isPending ? (
        <p className="mt-2 text-[11px] text-ink-subtle">Renewing playback token…</p>
      ) : null}
    </div>
  );
}
