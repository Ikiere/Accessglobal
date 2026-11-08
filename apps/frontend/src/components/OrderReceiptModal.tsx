import React from 'react';
import { IconCheck, IconPrinter, IconClose } from './icons';

export interface OrderDetails {
  orderNumber: string;
  dbId?: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerCountry: string;
  status?: string;
  items: {
    id: string;
    name: string;
    maker: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
}

interface OrderReceiptModalProps {
  order: OrderDetails | null;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        backgroundColor: 'rgba(18, 21, 22, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-3)',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-overlay)',
          padding: 'var(--space-8)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close invoice"
          className="btn-subtle"
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px' }}
        >
          <IconClose size={20} />
        </button>

        {/* Confirmation Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-round)',
              backgroundColor: 'var(--color-success-soft)',
              color: 'var(--color-success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-3)',
            }}
          >
            <IconCheck size={28} />
          </div>
          <h2 id="receipt-title" style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--color-ink)' }}>
            Order Confirmed & Bonded
          </h2>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
            Confirmation sent to <strong>{order.customerEmail}</strong>
          </p>
        </div>

        {/* Invoice Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-line)',
            borderRadius: 'var(--radius-2)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-line)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', textTransform: 'uppercase' }}>
                Order Number
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-ink)' }}>
                {order.orderNumber}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', textTransform: 'uppercase' }}>
                Date & Time
              </span>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink)' }}>
                {order.date}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', textTransform: 'uppercase' }}>
              Shipping Destination
            </span>
            <div style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>
              {order.customerName}
            </div>
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
              {order.customerAddress}, {order.customerCountry}
            </div>
          </div>

          {/* Line Items */}
          <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 'var(--space-3)' }}>
            {order.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBlock: '6px',
                  fontSize: 'var(--text-body-sm)',
                }}
              >
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{item.name}</span>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-subtle)', display: 'block' }}>
                    {item.maker} · Qty {item.quantity}
                  </span>
                </div>
                <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                  ${item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div style={{ borderTop: '1px solid var(--color-line)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>
              <span>Subtotal</span>
              <span className="tabular-nums">${order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)', color: 'var(--color-success)', marginTop: '4px' }}>
                <span>Promo Discount (GLOBAL10)</span>
                <span className="tabular-nums">-${order.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
              <span>International Bonded Shipping</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>FREE (Pre-cleared)</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--color-ink)',
                borderTop: '1px solid var(--color-line)',
                marginTop: 'var(--space-3)',
                paddingTop: 'var(--space-3)',
              }}
            >
              <span>Total Paid</span>
              <span className="tabular-nums">${order.total}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handlePrint}
            className="btn-outline"
            style={{ flex: 1, padding: '10px 16px' }}
          >
            <IconPrinter size={18} />
            Print Invoice
          </button>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ flex: 1, padding: '10px 16px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

