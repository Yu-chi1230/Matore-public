"use client";

import { Arrow } from "./site-chrome";

export function TopicLink({ topic, children = "このことを相談する" }: {
  topic: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href="#contact"
      className="text-link"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("consultation-topic", { detail: topic }),
        )
      }
    >
      {children}
      <Arrow />
    </a>
  );
}
