const words = [
  'E-Bikes',
  'Fashion',
  'Sneakers',
  'Appliances',
  'Perfumes',
  'Free shipping',
  'Buyer protection',
  'New drops daily',
];

export const Marquee = () => {
  const marqueeItems = [...words, ...words, ...words, ...words];

  return (
    <div className="mq" aria-hidden="true">
      <div className="mt" id="mt">
        {marqueeItems.map((word, index) => (
          <span key={index}>{word} ✦</span>
        ))}
      </div>
    </div>
  );
};
