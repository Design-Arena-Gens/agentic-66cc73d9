"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CharacterEntry = {
  id: string;
  char: string;
};

type Trail = {
  id: number;
  x: number;
  y: number;
};

type SwapCharacterAnimatorProps = {
  text: string;
  cadence: number;
  intensity: number;
};

const BASE_INTERVAL = 2200;

const makeEntries = (value: string): CharacterEntry[] =>
  value.split("").map((char, index) => ({
    id: `${char}-${index}-${value.length}-${Math.random().toString(36).slice(2, 6)}`,
    char,
  }));

const clampCadence = (value: number) => Math.max(320, Math.min(6200, value));

export function SwapCharacterAnimator({ text, cadence, intensity }: SwapCharacterAnimatorProps) {
  const [entries, setEntries] = useState<CharacterEntry[]>(() => makeEntries(text));
  const [recentSwapIds, setRecentSwapIds] = useState<string[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const trailId = useRef(0);
  const lastTextRef = useRef(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sanitizedCadence = useMemo(() => clampCadence(cadence || BASE_INTERVAL), [cadence]);
  const swapsPerTick = useMemo(() => Math.max(1, Math.min(6, intensity)), [intensity]);

  const setTrailState = useCallback((payload: Trail[] | ((prev: Trail[]) => Trail[])) => {
    setTrails((prev) => {
      const next = typeof payload === "function" ? (payload as (prev: Trail[]) => Trail[])(prev) : payload;
      return next.slice(-14);
    });
  }, []);

  useEffect(() => {
    if (text === lastTextRef.current) {
      return;
    }
    lastTextRef.current = text;
    setEntries(makeEntries(text));
    setTrailState([]);
    setRecentSwapIds([]);
  }, [setTrailState, text]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recentTimeoutRef.current) {
        clearTimeout(recentTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    charRefs.current = charRefs.current.slice(0, entries.length);
  }, [entries.length]);

  const dropTrail = useCallback(
    (index: number) => {
      const characterEl = charRefs.current[index];
      const containerEl = containerRef.current;
      if (!characterEl || !containerEl) {
        return;
      }
      const containerRect = containerEl.getBoundingClientRect();
      const charRect = characterEl.getBoundingClientRect();
      const x = charRect.left - containerRect.left + charRect.width / 2;
      const y = charRect.top - containerRect.top + charRect.height / 2;
      trailId.current += 1;
      setTrailState((prev) => [...prev, { id: trailId.current, x, y }]);
    },
    [setTrailState],
  );

  const performSwap = useCallback(() => {
    setEntries((prev) => {
      if (prev.length < 2) {
        return prev;
      }

      const next = [...prev];
      const swapIds: string[] = [];

      const swaps = Math.min(swapsPerTick, Math.floor(prev.length / 2));

      for (let attempt = 0; attempt < swaps; attempt += 1) {
        const firstIndex = Math.floor(Math.random() * prev.length);
        let secondIndex = Math.floor(Math.random() * prev.length);
        let guard = 0;
        while (secondIndex === firstIndex && guard < 6) {
          secondIndex = Math.floor(Math.random() * prev.length);
          guard += 1;
        }
        if (firstIndex === secondIndex) {
          continue;
        }

        dropTrail(firstIndex);
        dropTrail(secondIndex);

        const [first, second] = [next[firstIndex], next[secondIndex]];
        [next[firstIndex], next[secondIndex]] = [second, first];
        swapIds.push(next[firstIndex].id, next[secondIndex].id);
      }

      if (swapIds.length > 0) {
        if (recentTimeoutRef.current) {
          clearTimeout(recentTimeoutRef.current);
        }
        setRecentSwapIds(swapIds);
        recentTimeoutRef.current = setTimeout(() => setRecentSwapIds([]), 520);
        return next;
      }

      return prev;
    });
  }, [dropTrail, swapsPerTick]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const effectiveCadence = sanitizedCadence;
    intervalRef.current = setInterval(performSwap, effectiveCadence);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [performSwap, sanitizedCadence]);

  useEffect(() => {
    if (!intervalRef.current) {
      performSwap();
    }
  }, [performSwap]);

  return (
    <div ref={containerRef} className="swap-characters">
      {entries.map((entry, index) => (
        <motion.span
          key={entry.id}
          layout
          ref={(element) => {
            charRefs.current[index] = element;
          }}
          className={recentSwapIds.includes(entry.id) ? "pulsing" : undefined}
          transition={{
            type: "spring",
            stiffness: 620,
            damping: 38,
          }}
        >
          {entry.char === " " ? "\u00A0" : entry.char}
        </motion.span>
      ))}

      <div className="swap-trail">
        <AnimatePresence>
          {trails.map((trail) => (
            <motion.span
              key={trail.id}
              className="trail-dot"
              style={{ left: trail.x, top: trail.y }}
              initial={{ scale: 0.6, opacity: 0.18 }}
              animate={{ scale: 1, opacity: 0.28 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
