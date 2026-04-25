"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Stop, SpeakerHigh } from "@phosphor-icons/react";

interface ReadAloudProps {
  text: string;
  lang?: string;
}

const LANG_BCP47: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
};

export function ReadAloud({ text, lang = "en" }: ReadAloudProps) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [text]);

  if (!supported) return null;

  function play() {
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_BCP47[lang] ?? "en-US";
    utterance.rate = 0.92;
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setStatus("playing");
  }

  function pause() {
    window.speechSynthesis.pause();
    setStatus("paused");
  }

  function stop() {
    window.speechSynthesis.cancel();
    setStatus("idle");
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <SpeakerHigh size={14} weight="fill" />
        Read aloud
      </span>

      {status === "playing" ? (
        <button
          onClick={pause}
          className="flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/[0.04] px-3 py-1.5 text-xs font-medium text-foreground/70 transition-all hover:bg-foreground/[0.08] cursor-pointer"
          aria-label="Pause"
        >
          <Pause size={13} weight="fill" />
          Pause
        </button>
      ) : (
        <button
          onClick={play}
          className="flex items-center gap-1.5 rounded-lg border border-warm/30 bg-warm/10 px-3 py-1.5 text-xs font-medium text-warm transition-all hover:bg-warm/20 cursor-pointer"
          aria-label="Play"
        >
          <Play size={13} weight="fill" />
          {status === "paused" ? "Resume" : "Play"}
        </button>
      )}

      {status !== "idle" && (
        <button
          onClick={stop}
          className="flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/[0.04] px-3 py-1.5 text-xs font-medium text-foreground/70 transition-all hover:bg-foreground/[0.08] cursor-pointer"
          aria-label="Stop"
        >
          <Stop size={13} weight="fill" />
          Stop
        </button>
      )}
    </div>
  );
}
