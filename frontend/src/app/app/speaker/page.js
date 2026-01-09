"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PhonePage() {
	const [phones, setPhones] = useState([]);
	const router = useRouter();
	useEffect(() => {
		fetch('http://127.0.0.1:8000/analytics')
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data.analytics)) {
					const filtered = data.analytics.filter(item => item.type?.toLowerCase() === 'speakers').map(item => ({
						menuName: item.type,
						eventName: item.product_name,
						link: '/product/' + item.id,
						url: item.img_url || '/placeholder.jpg',
						price: item.our_price || '',
					}));
					setPhones(filtered);
				} else {
					setPhones([]);
				}
			});
	}, []);

	const handleLinkClick = (href, imgUrl, price) => {
		router.push(`/app/product/${href.split('/').pop()}?img=${encodeURIComponent(imgUrl)}&price=${encodeURIComponent(price)}`);
	};

	return (
		<div style={{ padding: 24 }}>
			<h2 style={{ marginBottom: 24, fontWeight: 700, fontSize: '2em', color: '#1976d2' }}>Speakers</h2>
			<div className="tiles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
				{phones.map((item, idx) => (
					<div key={idx} className="tile" style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #eee', padding: 12 }} onClick={() => handleLinkClick(item.link, item.url, item.price)}>
						<img src={item.url} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 8 }} />
						<span style={{ display: 'block', fontWeight: 600, marginTop: 8 }}>{item.eventName}</span>
						<div style={{ fontWeight: 600, color: '#1976d2', marginTop: 8 }}>
							{item.price ? `₹${item.price}` : 'Price not available'}
						</div>
					</div>
				))}
				{phones.length === 0 && (
					<div style={{ color: '#888', marginTop: 16 }}>No Speakers found.</div>
				)}
			</div>
		</div>
	);
}
