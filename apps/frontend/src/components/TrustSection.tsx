export const TrustSection = () => {
  return (
    <div className="trust" id="help">
      <div>
        <svg className="ic">
          <use href="#i-shield" />
        </svg>
        <h3>Buyer protection</h3>
        <p>Not as described? Get your money back within 30 days.</p>
      </div>
      <div>
        <svg className="ic">
          <use href="#i-badge" />
        </svg>
        <h3>Verified sellers</h3>
        <p>Every seller passes identity and quality checks before listing.</p>
      </div>
      <div>
        <svg className="ic">
          <use href="#i-truck" />
        </svg>
        <h3>Tracked delivery</h3>
        <p>Follow every parcel from warehouse to doorstep.</p>
      </div>
    </div>
  );
};
