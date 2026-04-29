import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioRecorderOptions {
  maxDurationSec?: number;
  preferredMimeType?: string;
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const { maxDurationSec = 120, preferredMimeType = 'audio/webm;codecs=opus' } = options;

  const [isSupported] = useState(
    typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    cleanupStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setDurationSec(0);
    setError(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl, cleanupStream, clearTimers]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (!isSupported) {
      setError('Gravação de áudio não suportada neste navegador.');
      return;
    }

    try {
      setError(null);
      chunksRef.current = [];
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setDurationSec(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported(preferredMimeType)
        ? preferredMimeType
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        clearTimers();
        cleanupStream();

        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        if (!blob.size) {
          setError('Não foi possível capturar o áudio. Tente novamente.');
          setIsRecording(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      tickRef.current = window.setInterval(() => {
        setDurationSec((prev) => prev + 1);
      }, 1000);

      timerRef.current = window.setTimeout(() => {
        stop();
      }, maxDurationSec * 1000);
    } catch (err: any) {
      cleanupStream();
      setIsRecording(false);
      setError(err?.message || 'Não foi possível acessar o microfone.');
    }
  }, [audioUrl, cleanupStream, clearTimers, isSupported, maxDurationSec, preferredMimeType, stop]);

  useEffect(() => {
    return () => {
      clearTimers();
      cleanupStream();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, cleanupStream, clearTimers]);

  return {
    isSupported,
    isRecording,
    audioBlob,
    audioUrl,
    durationSec,
    error,
    start,
    stop,
    reset,
  };
}
