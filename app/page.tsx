"use client";

import { useMemo, useState } from "react";
import { SwapCharacterAnimator } from "@/components/SwapCharacterAnimator";

const cadenceRange = {
  min: 600,
  max: 3200,
};

export default function HomePage() {
  const [phrase, setPhrase] = useState("2.2s swap character vibe");
  const [cadence, setCadence] = useState(2200);
  const [intensity, setIntensity] = useState(2);

  const cadenceLabel = useMemo(() => `${(cadence / 1000).toFixed(2)}s`, [cadence]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="title-row">
          <h1>
            Swap<span className="badge">2.2s cadence</span>
          </h1>
        </div>
        <p className="muted">
          Watch characters dance as pairs trade places in a looping cinematic swap. Tuned for a 2.2 second rhythm by default, but entirely yours to control.
        </p>
      </header>

      <section className="controls">
        <div className="control-row">
          <input
            className="input"
            placeholder="Enter a phrase to animate"
            value={phrase}
            onChange={(event) => setPhrase(event.target.value.slice(0, 48))}
          />
        </div>

        <div className="slider-row">
          <label htmlFor="cadence">Cadence {cadenceLabel}</label>
          <input
            id="cadence"
            type="range"
            min={cadenceRange.min}
            max={cadenceRange.max}
            step={100}
            value={cadence}
            onChange={(event) => setCadence(Number(event.target.value))}
          />
        </div>

        <div className="slider-row">
          <label htmlFor="intensity">Swap Wave {intensity}x</label>
          <input
            id="intensity"
            type="range"
            min={1}
            max={4}
            value={intensity}
            onChange={(event) => setIntensity(Number(event.target.value))}
          />
        </div>
      </section>

      <section className="swap-scene">
        <SwapCharacterAnimator text={phrase} cadence={cadence} intensity={intensity} />
      </section>

      <div className="meta-bar">
        <span className="meta-tag">Framer Motion layout transitions</span>
        <span className="meta-tag">2.2 second pulse ready</span>
        <span className="meta-tag">Interactive controls</span>
      </div>
    </main>
  );
}
