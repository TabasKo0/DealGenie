'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

export default function Page() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const imgUrl = searchParams.get('img');
  const price = searchParams.get('price');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const res = await fetch(`http://172.16.41.210:8000/product_by_id`, {
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

  if (loading) return <div style={{ color: 'black' }}>Loading...</div>;
  if (!product) return <div>Product not found.</div>;

  // Defensive: ensure specifications is always an array
  const specifications = Array.isArray(product?.specifications) ? product.specifications : [];

  return (
  <div style={{ color: 'black', padding: '2rem', background: '#fafafa', borderRadius: 16, boxShadow: '0 2px 8px #eee' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2rem' }}>
        {imgUrl && (
          <div style={{ flex: '0 0 auto', marginRight: '2rem', textAlign: 'center', position: 'relative', height: '300px' }}>
            <img
              src={imgUrl}
              height="300"
              width="300"
              alt={product?.name || 'Product Image'}
              style={{ maxWidth: '300px', borderRadius: '12px', boxShadow: '0 1px 6px #ddd', verticalAlign: 'top' }}
            />
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '300px', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '2em', fontWeight: 700, marginBottom: '1.5rem', marginTop: 0 }}>
            {product?.name || 'Product Details'}
          </h1>
          {/* Price above buttons */}
          <div style={{ fontSize: '1.5em', fontWeight: 600, color: '#1976d2', marginBottom: '1rem' }}>
            {price ? `Price: ₹${price}` : 'Price not available'}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-end' }}>
            <button
              style={{
                padding: '0.75em 2em',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1em',
                boxShadow: '0 1px 4px #ddd'
              }}
            >
              Add to Cart
            </button>
            <button
              style={{
                padding: '0.75em 2em',
                background: '#43a047',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1em',
                boxShadow: '0 1px 4px #ddd'
              }}
            >
              Buy
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
  );
}