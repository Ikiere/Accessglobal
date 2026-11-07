import React from 'react';
import { Link } from 'react-router-dom';
import { IconShieldCheck, IconTruck, IconRefresh, IconArrowRight } from '../components/icons';

export const AboutPage: React.FC = () => {
  return (
    <div style={{ paddingBlock: 'var(--space-10) var(--space-20)', backgroundColor: 'var(--color-bg)' }}>
      <div className="wrap">
        {/* Header */}
        <div style={{ maxWidth: '720px', marginBottom: 'var(--space-12)' }}>
          <span className="chip chip-accent" style={{ marginBottom: 'var(--space-2)' }}>
            About AccessGlobal
          </span>
          <h1 style={{ fontSize: 'var(--text-h1)', color: 'var(--color-ink)', marginBottom: 'var(--space-4)' }}>
            Direct from the world's most disciplined workshops.
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-muted)', lineHeight: '1.7' }}>
            We connect buyers directly to specialized independent workshops across 28 countries. We remove all distributors, middlemen markups, and surprise customs duties.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-16)',
          }}
        >
          {/* Pillar 1 */}
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-3)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-2)', backgroundColor: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
              <IconShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
              1. Direct Workshop Partnerships
            </h3>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              We deal only with the primary makers who forge the steel, tan the leather, and weave the linen. No anonymous re-packagers or dropshippers.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-3)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-2)', backgroundColor: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
              <IconTruck size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
              2. Pre-Cleared Customs
            </h3>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Every order includes all tariffs, duties, and import fees upfront. You will never receive a surprise courier bill at your doorstep.
            </p>
          </div>

          {/* Pillar 3 */}
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-3)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-2)', backgroundColor: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
              <IconRefresh size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
              3. 30-Day Inspection Window
            </h3>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Test and examine the item at home. If it does not meet your expectations, send it back to our local regional return center for a prompt refund.
            </p>
          </div>

          {/* Pillar 4 */}
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-3)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-2)', backgroundColor: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
              <IconShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
              4. Honest Material Disclosures
            </h3>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              We publish exact specifications: frame alloys, burr hardness ratings, leather tannery provenance, and fabric thread counts.
            </p>
          </div>
        </div>

        {/* Global Workshop Hubs */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-3)', padding: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}>
            Active Maker Hubs
          </h2>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-6)', maxWidth: '600px' }}>
            We work with verified independent workshops across Europe, Asia, and North America.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { city: 'Helsinki, Finland', domain: 'Urban E-Bikes & Smart Mobility', maker: 'Nordic Motion Labs' },
              { city: 'Innsbruck, Austria', domain: 'Alpine Mountain Machines', maker: 'Kallio Alpine Works' },
              { city: 'Normandy, France', domain: 'Organic Flax Linen Weaving', maker: 'Atelier Saint-Florent' },
              { city: 'Okayama, Japan', domain: 'Selvedge Shuttle Loom Denim', maker: 'Kojima Craft Guild' },
              { city: 'Tuscany, Italy', domain: 'Goodyear Welt Footwear', maker: 'Calzaturificio Varese' },
              { city: 'Stuttgart, Germany', domain: 'CNC Coffee Burr Engineering', maker: 'Mahlwerk Precision' },
            ].map((hub) => (
              <div key={hub.city} style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-line)' }}>
                <strong style={{ display: 'block', fontSize: 'var(--text-body-sm)', color: 'var(--color-ink)' }}>{hub.city}</strong>
                <span style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-accent)', fontWeight: 600, marginTop: '2px' }}>{hub.maker}</span>
                <span style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', marginTop: '2px' }}>{hub.domain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/shop" className="btn-primary" style={{ padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>Browse All Workshop Goods</span>
            <IconArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

