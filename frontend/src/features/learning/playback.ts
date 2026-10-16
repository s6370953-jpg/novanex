import type { TranscriptSegment } from './lesson.ts';

export interface PlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isReady: boolean;
  hasEnded: boolean;
  error: string | null;
}

export type PlaybackAction =
  | { type: 'time-update'; currentTime: number }
  | { type: 'metadata'; duration: number; currentTime: number }
  | { type: 'seek'; currentTime: number }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'ended' }
  | { type: 'loading' }
  | { type: 'ready' }
  | { type: 'error'; message: string };

export const initialPlaybackState: PlaybackState = {
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isReady: false,
  hasEnded: false,
  error: null,
};

function clampTime(currentTime: number, duration: number): number {
  const finiteTime = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  return duration > 0 ? Math.min(finiteTime, duration) : finiteTime;
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case 'time-update':
      return { ...state, currentTime: clampTime(action.currentTime, state.duration) };
    case 'metadata':
      return {
        ...state,
        duration: Number.isFinite(action.duration) ? Math.max(0, action.duration) : 0,
        currentTime: clampTime(action.currentTime, action.duration),
        isReady: true,
        error: null,
      };
    case 'seek':
      return { ...state, currentTime: clampTime(action.currentTime, state.duration), hasEnded: false };
    case 'play':
      return { ...state, isPlaying: true, hasEnded: false, error: null };
    case 'pause':
      return { ...state, isPlaying: false };
    case 'ended':
      return { ...state, currentTime: state.duration, isPlaying: false, hasEnded: true };
    case 'loading':
      return { ...state, isReady: false };
    case 'ready':
      return { ...state, isReady: true, error: null };
    case 'error':
      return { ...state, isPlaying: false, isReady: false, error: action.message };
  }
}

export function formatTimestamp(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
}

export function parseTimestampInput(value: string): number | null {
  const match = /^(\d+):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function getActiveTranscriptIndex(segments: TranscriptSegment[], currentTime: number): number {
  if (!Number.isFinite(currentTime) || currentTime < 0) return -1;
  let activeIndex = -1;
  segments.forEach((segment, index) => {
    if (
      currentTime >= segment.startTime &&
      currentTime < segment.endTime &&
      (activeIndex === -1 || segment.startTime >= segments[activeIndex].startTime)
    ) {
      activeIndex = index;
    }
  });
  return activeIndex;
}

export function getTranscriptSeekTime(segment: TranscriptSegment): number {
  return segment.startTime;
}
