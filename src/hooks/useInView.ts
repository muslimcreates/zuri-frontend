import { useEffect, useRef, useState } from "react";

// Powers the landing page's scroll-reveal animations (see components/Reveal.tsx).
// Fires once — the moment an element first crosses into the viewport it
// stops observing, so scrolling back up and down doesn't replay the
// animation on every pass, which would feel gimmicky rather than polished.
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect the OS-level "reduce motion" setting: skip the observer
    // entirely and just show the content immediately. This is a trust/UX
    // feature, not decoration someone should be forced to sit through.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}
