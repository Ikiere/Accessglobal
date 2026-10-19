import { useEffect, useRef, useState } from 'react';

interface StatItem {
  target: number;
  label: string;
}

const statsConfig: StatItem[] = [
  { target: 2400000, label: 'Happy shoppers' },
  { target: 18000, label: 'Verified sellers' },
  { target: 94, label: 'Countries served' },
  { target: 48, label: 'Hour average delivery' },
];

export const StatsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayValues, setDisplayValues] = useState<string[]>(['0', '0', '0', '0']);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let hasRun = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasRun) return;
          hasRun = true;
          observer.unobserve(entry.target);

          const startTime = performance.now();
          const duration = 1800;

          const step = (now: number) => {
            const p = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 4);

            const nextValues = statsConfig.map(({ target }) => {
              const v = Math.round(target * ease);
              if (target > 1000000) {
                return (v / 1000000).toFixed(1) + 'M';
              }
              if (target >= 1000) {
                return Math.round(v / 1000) + 'K+';
              }
              return v + (target === 48 ? 'h' : '+');
            });

            setDisplayValues(nextValues);

            if (p < 1) {
              requestAnimationFrame(step);
            }
          };

          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="stats" ref={containerRef}>
      {statsConfig.map((stat, idx) => (
        <div key={idx}>
          <b data-n={stat.target}>{displayValues[idx]}</b>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
