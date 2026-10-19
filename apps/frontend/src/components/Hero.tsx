import { useEffect, useRef, Fragment } from 'react';

const headlineLines = [
  { text: 'Everything the', isSun: false },
  { text: 'world makes.', isSun: true },
  { text: 'One market.', isSun: false },
];

export const Hero = () => {
  const charRefs = useRef<HTMLSpanElement[]>([]);
  charRefs.current = [];

  const addToRefs = (el: HTMLSpanElement | null) => {
    if (el && !charRefs.current.includes(el)) {
      charRefs.current.push(el);
    }
  };

  useEffect(() => {
    // On coarse touch devices (like mobile phones), avoid pointermove computation during scrolling
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let mx = -999;
    let my = -999;
    let tick = false;

    const frame = () => {
      tick = false;
      const chars = charRefs.current;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (!c) continue;
        const r = c.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2);
        const dy = my - (r.top + r.height / 2);
        const d = Math.sqrt(dx * dx + dy * dy);
        const t = Math.max(0, 1 - d / 260);
        c.style.fontWeight = String(Math.round(200 + t * 700));
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!tick) {
        tick = true;
        requestAnimationFrame(frame);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  let globalCharIndex = 0;

  return (
    <header className="hero">
      <div className="hero-art" aria-hidden="true">
        <div className="orb" />
      </div>

      <div className="wrap">
        <div className="pill">
          <i />
          Free shipping to 90+ countries
        </div>

        <h1 id="k" aria-label="Everything the world makes. One market.">
          {headlineLines.map((line, lineIdx) => {
            const words = line.text.split(' ');
            return (
              <span
                key={lineIdx}
                className={`hl ${line.isSun ? 'sun' : ''}`}
                aria-hidden="true"
              >
                {words.map((word, wordIdx) => {
                  return (
                    <Fragment key={wordIdx}>
                      <span className="w">
                        {word.split('').map((ch, chIdx) => {
                          const delay = 0.15 + globalCharIndex++ * 0.035;
                          return (
                            <span
                              key={chIdx}
                              ref={addToRefs}
                              className="c"
                              style={{ animationDelay: `${delay}s` }}
                            >
                              {ch}
                            </span>
                          );
                        })}
                      </span>
                      {wordIdx < words.length - 1 && ' '}
                    </Fragment>
                  );
                })}
              </span>
            );
          })}
        </h1>

        <p className="sub">
          E-bikes, fashion, footwear, home appliances and fragrances from
          verified sellers, delivered to your door and covered by buyer
          protection.
        </p>

        <div className="cta">
          <a href="#products" className="btn p">
            Shop trending
          </a>
          <a href="#shop" className="btn g">
            Browse categories
          </a>
        </div>
      </div>
    </header>
  );
};
