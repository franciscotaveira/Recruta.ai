import React, { useState } from 'react';
import { Loader2, Mic, RotateCcw, Square, Wand2 } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface AudioInputProps {
  maxDurationSec?: number;
  onTranscribe?: (audio: Blob) => Promise<void>;
  className?: string;
}

function formatDuration(sec: number): string {
  const mins = Math.floor(sec / 60)
    .toString()
    .padStart(2, '0');
  const secs = (sec % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

const AudioInput: React.FC<AudioInputProps> = ({
  maxDurationSec = 120,
  onTranscribe,
  className,
}) => {
  const { isSupported, isRecording, audioBlob, audioUrl, durationSec, error, start, stop, reset } =
    useAudioRecorder({ maxDurationSec });
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const canTranscribe = !!audioBlob && !!onTranscribe && !isTranscribing;

  async function handleTranscribe() {
    if (!audioBlob || !onTranscribe) return;
    setIsTranscribing(true);
    setTranscribeError(null);
    try {
      await onTranscribe(audioBlob);
    } catch (err: any) {
      setTranscribeError(err?.message || 'Falha ao transcrever áudio.');
    } finally {
      setIsTranscribing(false);
    }
  }

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40 ${className || ''}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={start}
            disabled={!isSupported}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold disabled:opacity-50"
          >
            <Mic size={16} /> Gravar áudio
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold"
          >
            <Square size={14} /> Parar
          </button>
        )}

        <button
          type="button"
          onClick={reset}
          disabled={!audioBlob && !isRecording}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium disabled:opacity-50"
        >
          <RotateCcw size={14} /> Limpar
        </button>

        {onTranscribe && (
          <button
            type="button"
            onClick={handleTranscribe}
            disabled={!canTranscribe}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold disabled:opacity-50"
          >
            {isTranscribing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {isTranscribing ? 'Transcrevendo...' : 'Transcrever áudio'}
          </button>
        )}

        <span className="ml-auto text-xs font-semibold text-slate-500">
          {isRecording
            ? `Gravando ${formatDuration(durationSec)} / ${formatDuration(maxDurationSec)}`
            : 'Até 2 minutos'}
        </span>
      </div>

      {audioUrl && (
        <div className="mt-3">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      {!isSupported && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
          Seu navegador não suporta gravação nativa de áudio.
        </p>
      )}

      {(error || transcribeError) && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error || transcribeError}</p>
      )}
    </div>
  );
};

export default AudioInput;
