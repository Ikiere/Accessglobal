import { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  bg: string;
  tag?: string;
  image: string;
}

const productsData: Product[] = [
  {
    id: 'p1',
    name: 'Volt X1 Commuter E-Bike',
    category: 'E-Bikes',
    price: 1299,
    bg: '#dcd8ff',
    tag: 'New',
    image:
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p2',
    name: 'Trail Pro Mountain E-Bike',
    category: 'E-Bikes',
    price: 2199,
    bg: '#d3f7ea',
    tag: 'Top rated',
    image:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    name: 'Linen Summer Dress',
    category: 'Clothing',
    price: 64,
    bg: '#ffe1ef',
    tag: 'Sale',
    image:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p4',
    name: 'Heritage Denim Jacket',
    category: 'Clothing',
    price: 89,
    bg: '#dfe9ff',
    tag: '',
    image:
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p5',
    name: 'AirStride Runner Sneakers',
    category: 'Shoes',
    price: 120,
    bg: '#ffe9c2',
    tag: 'Bestseller',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p6',
    name: 'Oxford Leather Derby',
    category: 'Shoes',
    price: 145,
    bg: '#f0e3d6',
    tag: '',
    image:
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p7',
    name: 'SmartChef Air Fryer 6L',
    category: 'Appliances',
    price: 99,
    bg: '#e2f4ff',
    tag: 'Hot',
    image:
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p8',
    name: 'CycloneVac Cordless Vacuum',
    category: 'Appliances',
    price: 249,
    bg: '#e9e1ff',
    tag: 'New',
    image:
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p9',
    name: 'Oud Noir Eau de Parfum',
    category: 'Perfumes',
    price: 78,
    bg: '#ffd9d2',
    tag: 'Limited',
    image:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p10',
    name: 'Citrus Bloom Eau de Toilette',
    category: 'Perfumes',
    price: 54,
    bg: '#fff2c4',
    tag: '',
    image:
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
  },
];

const categories = ['All', 'E-Bikes', 'Clothing', 'Shoes', 'Appliances', 'Perfumes'];

interface ProductGridProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  onAddToCart: (productName: string) => void;
}

export const ProductGrid = ({
  currentCategory,
  onSelectCategory,
  onAddToCart,
}: ProductGridProps) => {
  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});

  const filteredProducts = productsData.filter(
    (p) => currentCategory === 'All' || p.category === currentCategory
  );

  const handleAdd = (product: Product) => {
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    onAddToCart(product.name);

    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1400);
  };

  return (
    <>
      <div className="tabs" id="tabs" role="group" aria-label="Filter products">
        {categories.map((cat) => (
          <button
            key={cat}
            className="tab"
            aria-pressed={currentCategory === cat}
            data-c={cat}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid" id="grid">
        {filteredProducts.map((p, idx) => {
          const isAdded = addedIds[p.id];
          return (
            <article
              key={p.id}
              className="card"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="img" style={{ ['--bg' as string]: p.bg }}>
                <img alt={p.name} loading="lazy" src={p.image} />
                {p.tag && (
                  <em className="tag" style={{ fontStyle: 'normal' }}>
                    {p.tag}
                  </em>
                )}
              </div>
              <h4>{p.name}</h4>
              <small>{p.category}</small>
              <div className="row">
                <span className="pr">${p.price.toLocaleString()}</span>
                <button
                  className={`add ${isAdded ? 'ok' : ''}`}
                  data-n={p.name}
                  onClick={() => handleAdd(p)}
                >
                  {isAdded ? 'Added' : 'Add to cart'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
};
