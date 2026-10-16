export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  transcript?: TranscriptSegment[];
}

function isTranscriptSegment(segment: unknown): segment is TranscriptSegment {
  if (!segment || typeof segment !== 'object') return false;
  const item = segment as Partial<TranscriptSegment>;
  return typeof item.id === 'string' &&
    typeof item.startTime === 'number' &&
    Number.isFinite(item.startTime) &&
    typeof item.endTime === 'number' &&
    Number.isFinite(item.endTime) &&
    item.startTime >= 0 &&
    item.endTime > item.startTime &&
    typeof item.text === 'string' &&
    item.text.trim().length > 0;
}

export const demoLesson: Lesson = {
  id: 'demo-video-workspace',
  title: 'Demo Lesson: Video Workspace Tour',
  description: 'This short flower video is sample media for testing player controls. The transcript below is invented demo UI content, not text extracted from or synchronized with the video.',
  videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  transcript: [
    { id: 'demo-1', startTime: 0, endTime: 1, text: 'Sample transcript segment 1. Demo content, not extracted from the video.' },
    { id: 'demo-2', startTime: 1, endTime: 2, text: 'Sample transcript segment 2. Demo content, not extracted from the video.' },
    { id: 'demo-3', startTime: 2, endTime: 3, text: 'Sample transcript segment 3. Demo content, not extracted from the video.' },
    { id: 'demo-4', startTime: 3, endTime: 4, text: 'Sample transcript segment 4. Demo content, not extracted from the video.' },
    { id: 'demo-5', startTime: 4, endTime: 5, text: 'Sample transcript segment 5. Demo content, not extracted from the video.' },
  ],
};

export function validateVideoUrl(videoUrl: string): string | null {
  if (!videoUrl.trim()) return 'This lesson does not have a video URL yet.';

  let url: URL;
  try {
    url = new URL(videoUrl, 'https://learnova.invalid');
  } catch {
    return 'This lesson has an invalid video URL.';
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return 'Video URLs must use HTTP or HTTPS.';
  }

  const host = url.hostname.toLowerCase();
  if (
    host === 'youtu.be' ||
    host === 'youtube.com' ||
    host.endsWith('.youtube.com') ||
    host === 'vimeo.com' ||
    host.endsWith('.vimeo.com')
  ) {
    return 'This link is a third-party video page. Use a direct HTML5-compatible video URL instead.';
  }

  const extension = /\.([a-z0-9]+)$/i.exec(url.pathname)?.[1]?.toLowerCase();
  if (extension && !['mp4', 'm4v', 'webm', 'ogv', 'ogg'].includes(extension)) {
    return `The .${extension} file is not a supported direct HTML5 video format.`;
  }

  return null;
}

export function validateLesson(value: unknown): string | null {
  if (!value || typeof value !== 'object') return 'Lesson details are missing or invalid.';

  const lesson = value as Partial<Lesson>;
  if (typeof lesson.id !== 'string' || !lesson.id.trim()) return 'This lesson is missing its ID.';
  if (typeof lesson.title !== 'string' || !lesson.title.trim()) return 'This lesson is missing its title.';
  if (typeof lesson.description !== 'string') return 'This lesson has invalid description data.';
  if (typeof lesson.videoUrl !== 'string') return 'This lesson is missing its video URL.';

  const videoUrlError = validateVideoUrl(lesson.videoUrl);
  if (videoUrlError) return videoUrlError;

  if (lesson.transcript !== undefined) {
    if (!Array.isArray(lesson.transcript)) return 'This lesson has invalid transcript data.';
    const segmentsAreValid = (lesson.transcript as unknown[]).every(isTranscriptSegment);
    if (!segmentsAreValid) return 'This lesson contains an invalid transcript segment.';
  }

  return null;
}
