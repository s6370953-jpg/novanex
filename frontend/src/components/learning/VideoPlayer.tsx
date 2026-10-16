import { useState, type RefObject } from 'react';
import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { formatTimestamp, type PlaybackAction, type PlaybackState } from '../../features/learning/playback';

interface VideoPlayerProps {
  source: string;
  title: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  playback: PlaybackState;
  dispatch: (action: PlaybackAction) => void;
}

export default function VideoPlayer({ source, title, videoRef, playback, dispatch }: VideoPlayerProps) {
  const [volume, setVolume] = useState(0.8);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      void video.play().catch(() => {
        dispatch({ type: 'error', message: 'Playback could not start. Check the video URL and your browser permissions.' });
      });
    } else {
      video.pause();
    }
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(seconds)) return;
    video.currentTime = seconds;
    dispatch({ type: 'seek', currentTime: seconds });
  };

  const changeVolume = (value: number) => {
    const nextVolume = Math.max(0, Math.min(1, value));
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = nextVolume;
      videoRef.current.muted = nextVolume === 0;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) videoRef.current.muted = nextMuted;
  };

  const changeSpeed = (value: number) => {
    setSpeed(value);
    if (videoRef.current) videoRef.current.playbackRate = value;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void video.requestFullscreen().catch(() => {
        dispatch({ type: 'error', message: 'Fullscreen mode is not available in this browser.' });
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-[#111629] shadow-lg shadow-slate-900/10">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={source}
          preload="metadata"
          playsInline
          aria-label={title}
          className="h-full w-full object-contain"
          onLoadStart={() => dispatch({ type: 'loading' })}
          onLoadedMetadata={(event) => dispatch({
            type: 'metadata',
            duration: event.currentTarget.duration,
            currentTime: event.currentTarget.currentTime,
          })}
          onDurationChange={(event) => dispatch({
            type: 'metadata',
            duration: event.currentTarget.duration,
            currentTime: event.currentTarget.currentTime,
          })}
          onTimeUpdate={(event) => dispatch({ type: 'time-update', currentTime: event.currentTarget.currentTime })}
          onPlay={() => dispatch({ type: 'play' })}
          onPause={() => dispatch({ type: 'pause' })}
          onEnded={() => dispatch({ type: 'ended' })}
          onSeeking={(event) => dispatch({ type: 'seek', currentTime: event.currentTarget.currentTime })}
          onSeeked={(event) => dispatch({ type: 'seek', currentTime: event.currentTarget.currentTime })}
          onWaiting={() => dispatch({ type: 'loading' })}
          onCanPlay={() => dispatch({ type: 'ready' })}
          onError={(event) => {
            const videoError = event.currentTarget.error;
            const message = videoError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
              ? 'This video format or URL is not supported. Use a direct MP4, WebM, or Ogg video URL.'
              : 'The video could not be loaded. Check the URL and try again.';
            dispatch({ type: 'error', message });
          }}
        />
        {(!playback.isReady || playback.error) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111629]/90 px-5 text-center">
            {playback.error ? (
              <p role="alert" className="max-w-sm text-xs leading-5 text-rose-100">{playback.error}</p>
            ) : (
              <div role="status" className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Loading video…
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2.5 bg-[#171c2d] px-3.5 py-3 text-white sm:px-4">
        <div className="flex items-center gap-2.5">
          <span className="w-[42px] shrink-0 text-right text-[10px] tabular-nums text-slate-300">{formatTimestamp(playback.currentTime)}</span>
          <input
            type="range"
            min={0}
            max={playback.duration || 0}
            step={0.1}
            value={Math.min(playback.currentTime, playback.duration || 0)}
            disabled={!playback.isReady || playback.duration <= 0 || !!playback.error}
            aria-label="Seek video"
            onChange={(event) => seek(Number(event.currentTarget.value))}
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="w-[42px] shrink-0 text-[10px] tabular-nums text-slate-300">{formatTimestamp(playback.duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={togglePlayback} disabled={!!playback.error} aria-label={playback.isPlaying ? 'Pause video' : 'Play video'} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white transition hover:bg-white/10 disabled:opacity-40">
            {playback.isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
          </button>
          <span className="hidden text-[9px] text-slate-400 sm:inline">{playback.isPlaying ? 'Playing' : playback.hasEnded ? 'Finished' : 'Paused'}</span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Unmute video' : 'Mute video'} className="grid h-8 w-7 place-items-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              aria-label="Video volume"
              onChange={(event) => changeVolume(Number(event.currentTarget.value))}
              className="hidden h-1 w-16 cursor-pointer accent-violet-400 sm:block"
            />
            <label className="sr-only" htmlFor="playback-speed">Playback speed</label>
            <select
              id="playback-speed"
              value={speed}
              aria-label="Playback speed"
              onChange={(event) => changeSpeed(Number(event.currentTarget.value))}
              className="rounded-md border border-white/10 bg-[#22283a] px-2 py-1.5 text-[9px] text-white outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => <option key={rate} value={rate}>{rate}×</option>)}
            </select>
            <button type="button" onClick={toggleFullscreen} aria-label="Toggle fullscreen" className="grid h-8 w-8 place-items-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white">
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
