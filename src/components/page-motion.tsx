"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function MotionScene({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const scene = ref.current;
        if (!scene) return;
        const select = gsap.utils.selector(scene);
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(select(".hero-line > span"), {
            yPercent: 110,
            duration: 1.35,
            stagger: 0.17,
            opacity: 0,
          })
          .from(
            select(".hero-copy > .eyebrow"),
            { opacity: 0, y: 15, duration: 0.8 },
            0.1,
          )
          .from(
            select(".hero-description, .hero-copy > .cta, .cta-note"),
            { y: 25, opacity: 0, duration: 1, stagger: 0.12 },
            0.55,
          )
          .from(
            select(".hero-visual"),
            {
              y: 65,
              rotate: 3,
              opacity: 0,
              duration: 1.5,
              clearProps: "transform",
            },
            0.3,
          );

        gsap.to(select(".hero-visual .work-map"), {
          y: 55,
          rotation: -2,
          ease: "none",
          scrollTrigger: {
            trigger: select(".hero")[0],
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        select(".reveal").forEach((block: HTMLElement) => {
          const targets = block.classList.contains("entrance")
            ? [block]
            : Array.from(block.children);
          gsap.from(targets, {
            y: 55,
            opacity: 0,
            duration: 1.15,
            stagger: 0.16,
            ease: "power3.out",
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: block, start: "top 88%", once: true },
          });
        });
        scene
          .querySelectorAll<SVGSVGElement>(".entrance-drawing")
          .forEach((drawing) => {
            const strokes = Array.from(
              drawing.querySelectorAll<SVGGeometryElement>("path, rect"),
            );
            strokes.forEach((stroke) => {
              const length = stroke.getTotalLength();
              gsap.fromTo(
                stroke,
                { strokeDasharray: length, strokeDashoffset: length },
                {
                  strokeDashoffset: 0,
                  duration: 1.6,
                  ease: "power2.inOut",
                  scrollTrigger: {
                    trigger: drawing,
                    start: "top 88%",
                    once: true,
                  },
                },
              );
            });
          });
        const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => cancelAnimationFrame(refresh);
      },
      ref,
    );
    return () => media.revert();
  }, []);
  return (
    <main id="main" ref={ref}>
      {children}
    </main>
  );
}
