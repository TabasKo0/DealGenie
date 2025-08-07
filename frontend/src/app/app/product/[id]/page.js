'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function Page() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found.</div>;

  // Show product name and link if available
  return (
    <div>
      <h2>{product.name || 'Product Details'}</h2>
      {product.url && (
        <a href={product.url} target="_blank" rel="noopener noreferrer">View Product</a>
      )}
      <ul>
        {Array.isArray(product.specifications) && product.specifications.map((item, idx) => (
          <li key={idx}>
            <strong>{item.label}:</strong> {Array.isArray(item.value) ? item.value.join(', ') : String(item.value)}
          </li>
        ))}
      </ul>
    </div>
  );
}