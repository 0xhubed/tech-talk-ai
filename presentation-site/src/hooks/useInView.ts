"use client";

import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
};

export function useInView<T extends HTMLElement>({
  rootMargin = "0px",
  threshold = 0.35,
  once = true,
}: UseInViewOptions = {}) {
  const elementRef = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { root: null, rootMargin, threshold },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return { ref: elementRef, inView } as const;
}
