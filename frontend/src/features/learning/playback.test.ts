import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TranscriptSegment } from './lesson.ts';
import { validateLesson, validateVideoUrl } from './lesson.ts';
import {
  formatTimestamp,
  getActiveTranscriptIndex,
  getTranscriptSeekTime,
  initialPlaybackState,
  parseTimestampInput,
  playbackReducer,
} from './playback.ts';

const transcript: TranscriptSegment[] = [
  { id: 'one', startTime: 0, endTime: 5, text: 'First segment' },
  { id: 'two', startTime: 5, endTime: 10, text: 'Second segment' },
];

describe('video playback helpers', () => {
  it('formats finite timestamps as mm:ss', () => {
    assert.equal(formatTimestamp(0), '00:00');
    assert.equal(formatTimestamp(65.8), '01:05');
    assert.equal(formatTimestamp(3600), '60:00');
    assert.equal(formatTimestamp(Number.NaN), '00:00');
  });

  it('parses mm:ss transcript timestamps and rejects invalid values', () => {
    assert.equal(parseTimestampInput('02:35'), 155);
    assert.equal(parseTimestampInput('2:05'), 125);
    assert.equal(parseTimestampInput('2:75'), null);
    assert.equal(parseTimestampInput('2m05'), null);
  });

  it('updates current playback time from video timeupdate events', () => {
    const withDuration = playbackReducer(initialPlaybackState, { type: 'metadata', duration: 80, currentTime: 0 });
    const updated = playbackReducer(withDuration, { type: 'time-update', currentTime: 12.75 });

    assert.equal(updated.currentTime, 12.75);
    assert.equal(formatTimestamp(updated.currentTime), '00:12');
  });

  it('uses a transcript segment start as its seek target', () => {
    assert.equal(getTranscriptSeekTime(transcript[1]), 5);
    const state = playbackReducer(
      { ...initialPlaybackState, duration: 20 },
      { type: 'seek', currentTime: getTranscriptSeekTime(transcript[1]) },
    );
    assert.equal(state.currentTime, 5);
  });

  it('keeps the active transcript segment aligned to playback time', () => {
    assert.equal(getActiveTranscriptIndex(transcript, 0), 0);
    assert.equal(getActiveTranscriptIndex(transcript, 4.99), 0);
    assert.equal(getActiveTranscriptIndex(transcript, 5), 1);
    assert.equal(getActiveTranscriptIndex(transcript, 10), -1);
    assert.equal(getActiveTranscriptIndex([
      ...transcript,
      { id: 'overlap', startTime: 2, endTime: 4, text: 'Overlapping segment' },
    ], 3), 2);
  });

  it('rejects missing, invalid, and non-direct video lesson data', () => {
    assert.match(validateLesson(undefined) ?? '', /missing or invalid/i);
    assert.match(validateLesson({ id: 'lesson', title: 'Lesson', description: '', videoUrl: '' }) ?? '', /does not have a video URL/i);
    assert.match(validateVideoUrl('https://www.youtube.com/watch?v=demo') ?? '', /direct HTML5-compatible/i);
    assert.match(validateVideoUrl('javascript:alert(1)') ?? '', /HTTP or HTTPS/i);
  });

  it('accepts valid video lesson data without a transcript', () => {
    assert.equal(validateLesson({
      id: 'lesson-1',
      title: 'A lesson',
      description: 'A description',
      videoUrl: 'https://cdn.example.test/lesson.mp4',
    }), null);
  });

  it('rejects malformed transcript segments', () => {
    assert.match(validateLesson({
      id: 'lesson-1',
      title: 'A lesson',
      description: '',
      videoUrl: 'https://cdn.example.test/lesson.mp4',
      transcript: [{ id: 'bad', startTime: 12, endTime: 10, text: 'Invalid timing' }],
    }) ?? '', /invalid transcript segment/i);
    assert.match(validateLesson({
      id: 'lesson-2',
      title: 'A lesson',
      description: '',
      videoUrl: 'https://cdn.example.test/lesson.mp4',
      transcript: [null],
    }) ?? '', /invalid transcript segment/i);
  });
});
