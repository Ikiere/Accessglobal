interface BentoCategoriesProps {
  onSelectCategory: (category: string) => void;
}

interface TileItem {
  name: string;
  category: string;
  description: string;
  image: string;
  gradient: string;
  iconId: string;
  className: string;
}

const tiles: TileItem[] = [
  {
    name: 'E-Bikes',
    category: 'E-Bikes',
    description: 'Commute farther with 80 km range models from 1,200+ makers.',
    image:
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, #4a3cff, #3ee6b0)',
    iconId: '#i-bike',
    className: 'tile t1',
  },
  {
    name: 'Clothing',
    category: 'Clothing',
    description: 'New drops every week.',
    image:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, #ff4fa0, #ffb21e)',
    iconId: '#i-shirt',
    className: 'tile',
  },
  {
    name: 'Shoes',
    category: 'Shoes',
    description: 'Sneakers to formal.',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, #ffb21e, #ff6a3d)',
    iconId: '#i-shoe',
    className: 'tile',
  },
  {
    name: 'Home appliances',
    category: 'Appliances',
    description: 'Kitchen, cleaning and comfort with warranty included.',
    image:
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, #7a2cff, #4a3cff)',
    iconId: '#i-app',
    className: 'tile t4',
  },
  {
    name: 'Perfumes',
    category: 'Perfumes',
    description: 'Authentic scents only.',
    image:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, #3ee6b0, #1b9aff)',
    iconId: '#i-perf',
    className: 'tile',
  },
  {
    name: 'And more',
    category: 'All',
    description: 'Gifts, tech, decor.',
    image:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, #ff6a3d, #ff4fa0)',
    iconId: '#i-gift',
    className: 'tile',
  },
];

export const BentoCategories = ({ onSelectCategory }: BentoCategoriesProps) => {
  return (
    <section className="sec" id="shop">
      <div className="wrap">
        <h2>
          Six aisles. <em>One checkout.</em>
        </h2>
        <p className="lead">
          Pick an aisle and start browsing. Your cart works across every seller.
        </p>

        <div className="bento">
          {tiles.map((tile, idx) => (
            <a
              key={idx}
              href="#products"
              className={tile.className}
              style={{ ['--g' as string]: tile.gradient }}
              data-f={tile.category}
              onClick={() => onSelectCategory(tile.category)}
            >
              <img src={tile.image} alt={tile.name} loading="lazy" />
              <span className="e">
                <svg className="ic">
                  <use href={tile.iconId} />
                </svg>
              </span>
              <h3>{tile.name}</h3>
              <p>{tile.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
