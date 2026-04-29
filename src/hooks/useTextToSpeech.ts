import { useCallback, useMemo, useState } from 'react';

interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTextToSpeech(defaultLang = 'pt-BR') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = useMemo(
    () => typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined',
    []
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (!isSupported) {
        setError('Text-to-speech não suportado neste navegador.');
        return;
      }
      if (!text.trim()) return;

      try {
        setError(null);
        stop();

        const utter = new SpeechSynthesisUtterance(text.trim());
        utter.lang = options.lang || defaultLang;
        utter.rate = options.rate ?? 1;
        utter.pitch = options.pitch ?? 1;
        utter.volume = options.volume ?? 1;

        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => {
          setIsSpeaking(false);
          setError('Falha ao reproduzir áudio sintetizado.');
        };

        window.speechSynthesis.speak(utter);
      } catch (err: any) {
        setIsSpeaking(false);
        setError(err?.message || 'Falha ao iniciar text-to-speech.');
      }
    },
    [defaultLang, isSupported, stop]
  );

  return {
    isSupported,
    isSpeaking,
    error,
    speak,
    stop,
  };
}
