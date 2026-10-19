import React, { useState, useMemo } from 'react';
import { RefreshIcon, CheckCircleIcon, ArrowRightIcon, ZapIcon } from './Icons';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number; // 1 USD = X Currency
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rateToUSD: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToUSD: 0.924 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateToUSD: 0.789 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rateToUSD: 1.372 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateToUSD: 1.518 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateToUSD: 1.342 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateToUSD: 153.25 },
];

interface RateCalculatorProps {
  onOpenModal: (initialNote?: string) => void;
}

export const RateCalculator: React.FC<RateCalculatorProps> = ({ onOpenModal }) => {
  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('EUR');
  const [amountStr, setAmountStr] = useState('10000');
  const [inputError, setInputError] = useState<string | null>(null);

  const fromCurr = useMemo(() => SUPPORTED_CURRENCIES.find(c => c.code === fromCode) || SUPPORTED_CURRENCIES[0], [fromCode]);
  const toCurr = useMemo(() => SUPPORTED_CURRENCIES.find(c => c.code === toCode) || SUPPORTED_CURRENCIES[1], [toCode]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmountStr(val);
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setInputError('Please enter a valid transfer amount greater than 0.');
    } else if (num > 5000000) {
      setInputError('For transfers above 5,000,000, please contact our Institutional Desk.');
    } else {
      setInputError(null);
    }
  };

  const swapCurrencies = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const amount = parseFloat(amountStr) || 0;

  // Calculation logic:
  // Convert from -> USD -> to
  const rate = toCurr.rateToUSD / fromCurr.rateToUSD;
  const feePercent = 0.0035; // 0.35% transparent institutional fee
  const networkFee = amount * feePercent;
  const netAmount = Math.max(0, amount - networkFee);
  const recipientAmount = netAmount * rate;

  const handleLockRate = () => {
    const summary = `Transfer Request: ${fromCurr.symbol}${amount.toLocaleString()} ${fromCode} to ${toCurr.symbol}${recipientAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${toCode} (Rate: 1 ${fromCode} = ${rate.toFixed(4)} ${toCode})`;
    onOpenModal(summary);
  };

  return (
    <section id="rates" className="calculator-section">
      <div className="container">
        <div className="section-header">
          <span className="badge">Transparent Pricing</span>
          <h2 className="section-title">Live Currency & Settlement Calculator</h2>
          <p className="section-subtitle">
            Zero hidden spreads. Direct mid-market institutional liquidity rates updated in real-time.
          </p>
        </div>

        <div className="calculator-card glass-panel">
          <div className="calculator-grid">
            {/* Sender Column */}
            <div className="calc-col">
              <label htmlFor="send-amount" className="calc-label">You Send</label>
              <div className="calc-input-wrapper">
                <span className="curr-symbol">{fromCurr.symbol}</span>
                <input
                  id="send-amount"
                  type="number"
                  min="1"
                  step="any"
                  value={amountStr}
                  onChange={handleAmountChange}
                  className={`calc-input ${inputError ? 'input-error' : ''}`}
                  aria-invalid={!!inputError}
                  aria-describedby={inputError ? 'calc-error' : undefined}
                />
                <select
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value)}
                  className="curr-select"
                  aria-label="Send Currency"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.name})</option>
                  ))}
                </select>
              </div>
              {inputError && <span id="calc-error" className="error-text">{inputError}</span>}
            </div>

            {/* Swap Button */}
            <div className="calc-swap-wrapper">
              <button
                type="button"
                onClick={swapCurrencies}
                className="btn-swap"
                aria-label="Swap send and receive currencies"
                title="Swap currencies"
              >
                <RefreshIcon size={18} />
              </button>
            </div>

            {/* Recipient Column */}
            <div className="calc-col">
              <label htmlFor="receive-amount" className="calc-label">Recipient Receives (Estimated)</label>
              <div className="calc-input-wrapper">
                <span className="curr-symbol">{toCurr.symbol}</span>
                <input
                  id="receive-amount"
                  type="text"
                  readOnly
                  value={recipientAmount > 0 ? recipientAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  className="calc-input calc-input-readonly"
                />
                <select
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value)}
                  className="curr-select"
                  aria-label="Receive Currency"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.name})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Breakdown Details */}
          <div className="calc-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Institutional Exchange Rate:</span>
              <span className="breakdown-value font-mono">1 {fromCode} = {rate.toFixed(4)} {toCode}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Platform Fee (0.35% flat):</span>
              <span className="breakdown-value">{fromCurr.symbol}{networkFee.toFixed(2)} {fromCode}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Guaranteed Settlement Speed:</span>
              <span className="breakdown-value text-success font-medium">
                <ZapIcon size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Instant (&lt;15 seconds)
              </span>
            </div>
          </div>

          <div className="calc-footer">
            <div className="guarantee-note">
              <CheckCircleIcon size={16} className="text-brand" />
              <span>Rates guaranteed for 120 seconds upon checkout lock.</span>
            </div>
            <button
              onClick={handleLockRate}
              disabled={!!inputError || amount <= 0}
              className="btn btn-primary"
            >
              Lock Rate & Open Account <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
