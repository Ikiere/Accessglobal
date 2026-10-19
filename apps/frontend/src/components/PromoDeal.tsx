import { useEffect, useState } from 'react';

interface PromoDealProps {
  onSelectCategory: (category: string) => void;
}

export const PromoDeal = ({ onSelectCategory }: PromoDealProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: string;
    hours: string;
    mins: string;
    secs: string;
  }>({
    days: '06',
    hours: '05',
    mins: '00',
    secs: '00',
  });

  useEffect(() => {
    // 6 days and 5 hours from load
    const endTime = Date.now() + 6 * 86400000 + 5 * 3600000;

    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0'),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="promo" id="deal">
      <div>
        <h2>E-Bike Week. Up to 35% off.</h2>
        <div className="timer" id="timer">
          <div>
            <b>{timeLeft.days}</b>
            <span>days</span>
          </div>
          <div>
            <b>{timeLeft.hours}</b>
            <span>hours</span>
          </div>
          <div>
            <b>{timeLeft.mins}</b>
            <span>mins</span>
          </div>
          <div>
            <b>{timeLeft.secs}</b>
            <span>secs</span>
          </div>
        </div>
        <a
          href="#products"
          className="btn"
          style={{
            background: 'var(--paper)',
            color: 'var(--ink)',
            display: 'inline-block',
          }}
          data-f="E-Bikes"
          onClick={() => onSelectCategory('E-Bikes')}
        >
          Shop e-bike deals
        </a>
      </div>
      <div className="big" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=700&auto=format&fit=crop&q=80"
          alt="E-Bike Deal"
          loading="lazy"
        />
      </div>
    </div>
  );
};
