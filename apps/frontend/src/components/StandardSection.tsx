import React from 'react';
import { IconShieldCheck, IconTruck, IconRefresh } from './icons';

export const StandardSection: React.FC = () => {
  return (
    <section id="standard" style={{ paddingBlock: 'var(--space-16)', borderTop: '1px solid var(--color-line)' }}>
      <div className="wrap">
        <div style={{ maxWidth: '680px', marginBottom: 'var(--space-12)' }}>
          <span className="chip chip-accent" style={{ marginBottom: 'var(--space-3)' }}>
            <IconShieldCheck size={14} />
            Integrity Guarantee
          </span>
          <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-4)', color: 'var(--color-ink)' }}>
            The AGM Standard: Craft with verifiable provenance.
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-muted)', lineHeight: '1.65' }}>
            International commerce has long suffered from hidden customs duties, diluted materials, and disconnected middlemen. We built AccessGlobal to eliminate all three.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-16)',
          }}
        >
          {/* Pillar 1 */}
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-3)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-2)', backgroundColor: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
              <IconShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-ink)' }}>
              Audited Workshop Origin
            </h3>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              We partner directly with the primary workshops that mill the aluminum, sew the selvedge, or bench-make the soles. Zero unverified brokers or rebranded drop-shippers.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-3)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-2)', backgroundColor: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
              <IconTruck size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-ink)' }}>
              Pre-Cleared Customs & Taxes
            </h3>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Import duties, tariffs, and VAT are calculated and bonded at checkout. You will never receive an unexpected invoice from an international courier at your doorstep.
            </p>
          </div>

          {/* Pillar 3 */}
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-3)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-2)', backgroundColor: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
              <IconRefresh size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-ink)' }}>
              30-Day Inspection Period
            </h3>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Examine the craftsmanship in natural light. If the dimensions, texture, or performance fail your expectations, utilize our localized return centers for a hassle-free refund.
            </p>
          </div>
        </div>

        {/* Provenance Comparison Table */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-3)', padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-ink)' }}>
            Marketplace Comparison
          </h3>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-6)' }}>
            How AccessGlobal compares to traditional import channels.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-body-sm)', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <th style={{ padding: '10px 12px', color: 'var(--color-ink-muted)', fontWeight: 500 }}>Dimension</th>
                  <th style={{ padding: '10px 12px', color: 'var(--color-accent)', fontWeight: 600, backgroundColor: 'var(--color-accent-soft)' }}>AccessGlobal (AGM)</th>
                  <th style={{ padding: '10px 12px', color: 'var(--color-ink-muted)', fontWeight: 500 }}>Grey-Market Importers</th>
                  <th style={{ padding: '10px 12px', color: 'var(--color-ink-muted)', fontWeight: 500 }}>Department Retailers</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={{ padding: '12px', fontWeight: 500, color: 'var(--color-ink)' }}>Maker Disclosure</td>
                  <td style={{ padding: '12px', backgroundColor: 'var(--color-accent-soft)', fontWeight: 600, color: 'var(--color-accent)' }}>100% Named Workshop & City</td>
                  <td style={{ padding: '12px', color: 'var(--color-ink-muted)' }}>Concealed / Anonymous</td>
                  <td style={{ padding: '12px', color: 'var(--color-ink-muted)' }}>White-labeled private brand</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={{ padding: '12px', fontWeight: 500, color: 'var(--color-ink)' }}>Tariff Protection</td>
                  <td style={{ padding: '12px', backgroundColor: 'var(--color-accent-soft)', fontWeight: 600, color: 'var(--color-accent)' }}>Pre-bonded ($0 Surprise)</td>
                  <td style={{ padding: '12px', color: 'var(--color-ink-muted)' }}>Buyer billed upon delivery</td>
                  <td style={{ padding: '12px', color: 'var(--color-ink-muted)' }}>Embedded 40–60% markups</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={{ padding: '12px', fontWeight: 500, color: 'var(--color-ink)' }}>Return Channel</td>
                  <td style={{ padding: '12px', backgroundColor: 'var(--color-accent-soft)', fontWeight: 600, color: 'var(--color-accent)' }}>Local regional return hub</td>
                  <td style={{ padding: '12px', color: 'var(--color-ink-muted)' }}>High-cost international return</td>
                  <td style={{ padding: '12px', color: 'var(--color-ink-muted)' }}>In-store or postal return</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

