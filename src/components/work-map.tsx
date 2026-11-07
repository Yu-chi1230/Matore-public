"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow } from "./site-chrome";

const notes = [
  { title: "この数式、うまく動かない。", sub: "Excel・スプレッドシート", type: "改善" },
  { title: "この集計、毎月手作業。", sub: "CSV・データ加工", type: "集計" },
  { title: "回答のあと、通知も手作業。", sub: "Googleサービス・GAS", type: "連携" },
];

export function WorkMap() {
  const [iteration, setIteration] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return;
    element.dataset.motion = "waiting";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.45) {
          element.dataset.motion = "playing";
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="work-map"
      aria-label="表の困りごとや手作業を、改善・集計・連携の仕組みに整えるイメージ"
    >
      <div className="map-top">
        <span>毎日の仕事の、小さな改善室</span>
        <span className="map-index">FIELD NOTE / 01</span>
      </div>
      <div className="map-canvas" key={iteration}>
        <div className="map-axis">
          <span>いま、抱えていること</span>
          <span>次から、回る仕組みへ</span>
        </div>
        <div className="map-notes">
          {notes.map((note, index) => (
            <div key={note.type} className={`map-note note-${index}`}>
              <span className="note-number">0{index + 1}</span>
              <span className="note-copy">
                <strong>{note.title}</strong>
                <small>{note.sub}</small>
              </span>
              <span className="note-result">
                <span aria-hidden="true">✓</span>
                {note.type}
              </span>
            </div>
          ))}
        </div>
        <div className="map-conclusion">
          <span className="map-check" aria-hidden="true">
            ✓
          </span>
          <p>
            毎回の手作業を、少しずつ。
            <br />
            <strong>次から使える仕組みへ。</strong>
          </p>
        </div>
      </div>
      <div className="map-bottom">
        <span>整理する。つなぐ。仕組みにする。</span>
        <button
          type="button"
          onClick={() => setIteration(iteration + 1)}
          aria-label="業務が整うアニメーションをもう一度見る"
        >
          もう一度見る
          <Arrow />
        </button>
      </div>
    </div>
  );
}
