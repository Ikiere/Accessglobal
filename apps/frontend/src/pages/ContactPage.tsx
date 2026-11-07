import React, { useState } from 'react';
import { IconShieldCheck, IconArrowRight } from '../components/icons';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('order');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please provide your name, email, and message.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Simulate sending inquiry to support API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 700);
  };

  return (
    <div style={{ paddingBlock: 'var(--space-10) var(--space-20)', backgroundColor: 'var(--color-bg)' }}>
      <div className="wrap">
        {/* Page Title */}
        <div style={{ maxWidth: '640px', marginBottom: 'var(--space-10)' }}>
          <span className="chip chip-accent" style={{ marginBottom: 'var(--space-2)' }}>
            Customer Support & Inquiries
          </span>
          <h1 style={{ fontSize: 'var(--text-h1)', color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}>
            We're here to help.
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
            Have a question about a maker workshop, an active shipment, or pre-cleared customs? Send us a message and our support team will reply within 24 hours.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
            gap: 'var(--space-10)',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column: Contact Form */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-line)',
              borderRadius: 'var(--radius-3)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-6)' }}>
              Send an Inquiry
            </h2>

            {isSuccess && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-accent-soft)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: 'var(--radius-2)',
                  color: 'var(--color-accent)',
                  fontSize: 'var(--text-body-sm)',
                  marginBottom: 'var(--space-6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <IconShieldCheck size={18} />
                <span>Thank you! Your message has been received. Our team will contact you shortly.</span>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-2)',
                  color: '#dc2626',
                  fontSize: 'var(--text-body-sm)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
                  Your Full Name <span style={{ color: 'var(--color-accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-2)',
                    border: '1px solid var(--color-line-strong)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-ink)',
                    fontSize: 'var(--text-body-sm)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
                  Email Address <span style={{ color: 'var(--color-accent)' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-2)',
                    border: '1px solid var(--color-line-strong)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-ink)',
                    fontSize: 'var(--text-body-sm)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
                  Topic of Inquiry
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-2)',
                    border: '1px solid var(--color-line-strong)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-ink)',
                    fontSize: 'var(--text-body-sm)',
                    outline: 'none',
                  }}
                >
                  <option value="order">Order Assistance & Delivery Tracking</option>
                  <option value="customs">Customs & Bonded Tariffs Questions</option>
                  <option value="specs">Technical Product Specifications</option>
                  <option value="partnership">Workshop Partnership Inquiries</option>
                  <option value="other">General Question</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
                  Message <span style={{ color: 'var(--color-accent)' }}>*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help you..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-2)',
                    border: '1px solid var(--color-line-strong)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-ink)',
                    fontSize: 'var(--text-body-sm)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 'var(--text-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: 'var(--space-2)',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                <IconArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Right Column: Support Details & Physical Hubs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Direct Support Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-3)',
                padding: 'var(--space-6)',
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}>
                Direct Contact
              </h3>
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)', lineHeight: '1.6' }}>
                Our logistics and workshop specialists respond directly to all inquiries.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-body-sm)' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Email Support</span>
                  <a href="mailto:support@accessglobal.market" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                    support@accessglobal.market
                  </a>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Operating Hours</span>
                  <strong style={{ color: 'var(--color-ink)' }}>Monday to Friday: 08:00 – 18:00 GMT</strong>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>Response Guarantee</span>
                  <strong style={{ color: 'var(--color-ink)' }}>Within 24 business hours</strong>
                </div>
              </div>
            </div>

            {/* Global Workshop Hubs Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-3)',
                padding: 'var(--space-6)',
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}>
                Regional Logistics Hubs
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
                <div>
                  <strong style={{ color: 'var(--color-ink)', display: 'block' }}>European Bonded Hub</strong>
                  <span>Kaisaniemenkatu 1, 00100 Helsinki, Finland</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-ink)', display: 'block' }}>United Kingdom Operations</strong>
                  <span>14 New Bond Street, Mayfair, London W1S 3PF, UK</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-ink)', display: 'block' }}>Asia-Pacific Workshop Center</strong>
                  <span>Kojima Chome, Kurashiki, Okayama 711-0913, Japan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

