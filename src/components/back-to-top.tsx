"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    let frame = 0;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setVisible(window.scrollY > 120);
        const distance =
          document.documentElement.scrollHeight - window.innerHeight;
        ref.current?.style.setProperty(
          "--page-progress",
          String(distance > 0 ? window.scrollY / distance : 0),
        );
      });
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);
  return (
    <a
      ref={ref}
      href="#main"
      className="floating-top"
      data-visible={visible}
      aria-label="TOPへ、ページの一番上に戻る"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={(event) => {
        event.preventDefault();
        document
          .querySelector<HTMLAnchorElement>(".brand")
          ?.focus({ preventScroll: true });
        window.scrollTo({
          top: 0,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
      }}
    >
      <span className="top-arrow" aria-hidden="true">
        ↑
      </span>
      <span>TOPへ</span>
      <span className="top-progress" aria-hidden="true" />
    </a>
  );
}
