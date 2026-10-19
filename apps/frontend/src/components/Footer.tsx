import { useState } from 'react';

interface FooterProps {
  onShowToast: (message: string) => void;
  onSelectCategory: (category: string) => void;
}

export const Footer = ({ onShowToast, onSelectCategory }: FooterProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onShowToast('You are in. Check your inbox for your 10% code.');
    setEmail('');
  };

  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer>
      <div className="wrap">
        <div className="fg">
          <div>
            <h5>Get 10% off your first order</h5>
            <p style={{ color: '#55587e' }}>
              Join for early access to drops and deals.
            </p>
            <form className="nl" id="nl" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="you@email.com"
                required
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Join</button>
            </form>
          </div>
          <div>
            <h5>Shop</h5>
            <ul>
              <li onClick={() => handleCategoryClick('E-Bikes')}>E-Bikes</li>
              <li onClick={() => handleCategoryClick('Clothing')}>Clothing</li>
              <li onClick={() => handleCategoryClick('Shoes')}>Shoes</li>
              <li onClick={() => handleCategoryClick('Appliances')}>Appliances</li>
              <li onClick={() => handleCategoryClick('Perfumes')}>Perfumes</li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li>About AGM</li>
              <li>Sell with us</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>
          <div>
            <h5>Support</h5>
            <ul>
              <li>Track order</li>
              <li>Returns</li>
              <li>Shipping</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>
        <div className="mega" aria-hidden="true">
          AGM
        </div>
        <div className="copy">
          <span>© 2026 Access Global Market. All rights reserved.</span>
          <span>Privacy · Terms · Cookies</span>
        </div>
      </div>
    </footer>
  );
};
