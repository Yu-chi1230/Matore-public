"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export function MotionRibbon() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="availability motion-ribbon" data-paused={paused}>
      <div className="container availability-inner">
        <p>
          <span className="status-dot" />
          {site.tagline}
        </p>
        <span>フルリモート</span>
        <span>文章からのご相談</span>
        <span>必要な範囲から</span>
      </div>
      <div className="ribbon-window" aria-hidden="true">
        <div className="ribbon-track">
          {[0, 1].map((index) => (
            <div className="ribbon-group" key={index}>
              <span>表を整える。</span>
              <i className="ribbon-divider" />
              <span>作業をつなぐ。</span>
              <i className="ribbon-divider" />
              <span>業務が回る。</span>
              <i className="ribbon-divider" />
            </div>
          ))}
        </div>
      </div>
      <div className="container ribbon-bottom">
        <p>
          日中は、あなたの仕事を。
          <span>平日夜・土日に、繰り返せる仕組みづくりを。</span>
        </p>
        <button
          type="button"
          className="ribbon-pause"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
          {paused ? "動きを再開" : "動きを止める"}
        </button>
      </div>
    </div>
  );
}
