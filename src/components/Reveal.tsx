import type { ReactNode } from "react";
import { useInView } from "../hooks/useInView";

// Wraps content that should fade/rise into place as it scrolls into view —
// used across the landing page (see styles/global.css ".reveal") to give
// the page a more polished, considered feel than everything just being
// static and instantly present. `delay` staggers a group of siblings (e.g.
// feature cards, product cards) so they cascade in rather than all popping
// at once.
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
