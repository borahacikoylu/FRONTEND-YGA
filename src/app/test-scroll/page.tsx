"use client";
import { useRef, useEffect } from "react";

export default function TestScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf: number;
    let last = performance.now();
    const speed = 200; // px/s

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += speed * dt;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ width: "100vw", overflowX: "auto", whiteSpace: "nowrap" }} ref={ref}>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            display: "inline-block",
            width: 300,
            height: 200,
            margin: 10,
            background: "#333",
            color: "#fff",
            textAlign: "center",
            lineHeight: "200px",
            fontSize: 32,
            borderRadius: 16,
          }}
        >
          Kart {i + 1}
        </div>
      ))}
    </div>
  );
}
