'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast';
import Loading from './../../loading.js';

export default function Page() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const imgUrl = searchParams.get('img');
  const price = searchParams.get('price');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [finalprice, setFinalPrice] = useState(null);
  const [fn, setfn] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/product_by_id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const response = await res.json();
      if (response.status === 'success' && response.data) {
        setProduct(response.data);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  function getUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log(user);
      return user
    } catch {
      return 'guest';
    }
  }

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    try {
      const userId = getUserId();
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userId,
          item: id,
          itemimg: imgUrl,
          quantity: 1,
          price: finalprice || price
        })
      });
      const data = await res.json();
      console.log(data);
      if (data.success) {
        toast.success('Added to cart!');
      } else {
        toast.error('Failed to add to cart.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error adding to cart.');
    }
    setAdding(false);
  }

  async function finalOffer() {
    setfn(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/competitive_price/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFinalPrice(data.discounted_price);
      toast.success(`Final offer price: ₹${data.discounted_price}`);
      console.log('Competitive price data:', data);
      return data; // e.g. { discounted_price: 123.45 }
    } catch (error) {
      console.error('Failed to fetch competitive price:', error);
    }
  }

  if (loading) return <div style={{ color: 'black' }}><Loading /></div>;
  if (!product) return <div>Product not found.</div>;

  const specifications = Array.isArray(product?.specifications) ? product.specifications : [];

  const buttonStyle = {
    padding: '0.75em 2em',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '1em',
    boxShadow: '0 1px 4px #ddd',
    transition: 'all 0.2s ease',
    transform: adding ? 'scale(0.95)' : 'scale(1)'
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .container {
            padding: 1rem !important;
          }
          .flex-row {
            flex-direction: column !important;
          }
          .img-wrapper {
            margin-right: 0 !important;
            margin-bottom: 1.5rem;
            height: auto !important;
            text-align: center !important;
          }
          .img-wrapper img {
            width: 100% !important;
            max-width: 300px !important;
            height: auto !important;
          }
          .details {
            height: auto !important;
            justify-content: flex-start !important;
          }
          h1 {
            font-size: 1.5em !important;
          }
          .price {
            font-size: 1.25em !important;
          }
          .buttons {
            flex-direction: column !important;
            gap: 0.75rem !important;
            align-self: stretch !important;
          }
          .buttons button {
            width: 100% !important;
          }
          table {
            font-size: 0.9em !important;
          }
        }
      `}</style>
      <div className="container" style={{ color: 'black', padding: '2rem', background: '#fafafa', borderRadius: 16, boxShadow: '0 2px 8px #eee' }}>
        <div className="flex-row" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2rem' }}>
          {imgUrl && (
            <div className="img-wrapper" style={{ flex: '0 0 auto', marginRight: '2rem', textAlign: 'center', position: 'relative', height: '300px' }}>
              <img
                src={imgUrl}
                height="300"
                width="300"
                alt={product?.name || 'Product Image'}
                style={{ maxWidth: '300px', borderRadius: '12px', boxShadow: '0 1px 6px #ddd', verticalAlign: 'top' }}
              />
            </div>
          )}
          <div className="details" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '300px', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '2em', fontWeight: 700, marginBottom: '1.5rem', marginTop: 0 }}>
              {product?.name || 'Product Details'}
            </h1>
            {/* Price above buttons */}
            <div className="price" style={{ fontSize: '1.5em', fontWeight: 600, color: '#1976d2', marginBottom: '1rem' }}>
              <span><span>Price:</span><span>{price ? `₹${price}` : 'Price not available'}</span></span>
            </div>

            <div className="price" style={{ fontSize: '1.5em', fontWeight: 600, color: '#1976d2', marginBottom: '1rem' }}>
              {finalprice ? <span><span>Final Price:</span><span>{finalprice ? `₹${finalprice}` : 'Price not available'}</span></span> : '\n'}
            </div>

            <div className="buttons" style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-end' }}>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                style={{
                  ...buttonStyle,
                  background: '#1976d2'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = adding ? 'scale(0.95)' : 'scale(1)'}
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={finalOffer}
                style={{
                  ...buttonStyle,
                  background: '#43a047'
                }}
                className={fn ? 'disabled' : ''}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Final Offer
              </button>
            </div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <tbody>
            {specifications.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ fontWeight: 500, padding: '0.75em 1em', verticalAlign: 'top', width: '30%' }}>{item.label}</td>
                <td style={{ padding: '0.75em 1em', verticalAlign: 'top' }}>
                  {Array.isArray(item.value) ? item.value.join(', ') : String(item.value)}
                  {item.url && typeof item.url === 'string' && item.url.match(/^https?:\/\//) && (
                    <div style={{ marginTop: '0.5em' }}>
                      <img src={item.url} alt={item.label} style={{ maxWidth: '120px', borderRadius: 6, boxShadow: '0 1px 4px #eee' }} />
                      <div style={{ wordBreak: 'break-all', fontSize: '0.85em', color: '#888' }}>{item.url}</div>
                    </div>
                  )}
                  {item.link && typeof item.link === 'string' && item.link.match(/^https?:\/\//) && (
                    <div style={{ marginTop: '0.5em' }}>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', fontSize: '0.95em' }}>
                        {item.link}
                      </a>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Display price below item details */}
        {price && (
          <div style={{ marginTop: '2rem', fontSize: '1.5em', fontWeight: 600, color: '#1976d2' }}>
            Price: ₹{price}
          </div>
        )}
      </div>
      <Toaster />
    </>
  );
}
