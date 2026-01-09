
"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchPage() {
	// ...existing code...
	const getLastWord = (text) => {
		const words = text.trim().split(/\s+/);
		return words.length > 0 ? words[words.length - 1] : '';
	};
		const searchParams = useSearchParams();
		const initialResponse = searchParams.get('pageResponse');
		const [searchInput, setSearchInput] = useState("");
		const [searchLoading, setSearchLoading] = useState(false);
		const [responseText, setResponseText] = useState("");
		const [gridResults, setGridResults] = useState([]);

		useEffect(() => {
			if (initialResponse) {
				try {
					const parsed = JSON.parse(initialResponse);
					setResponseText(parsed?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(parsed));
				} catch (e) {
					setResponseText("Error parsing response.");
				}
			}
		}, [initialResponse]);

		const handleSearchSubmit = async (e) => {
			e.preventDefault();
			if (!searchInput.trim()) return;
			setSearchLoading(true);
			try {
				// Use the correct Gemini model and your API key
				const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyA_mFSLuNJ_AadK6BEAfgU8xEkGWMkjG00", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ contents: [{ parts: [{ text: (searchInput+".you are the dealgenie. based on the first sentence, recommend products, you may inquire about more specifications ,but keep it brief. do not use any markdown formatting , you may keep bullet points, also read the first sentance and return one of the following keywords at the end you your reply-phone,headphones,laptop,speakers,smart watches") }] }] })
				});
				const result = await response.json();
				const geminiText = result?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(result);
				setResponseText(geminiText);
				// Snip last word from Gemini's response
				const words = geminiText.trim().split(/\s+/);
				const lastWord = words.length > 0 ? words[words.length - 1].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : '';
                console.log(lastWord);
				// Fetch data from server using lastWord
				if (lastWord) {
					const res = await fetch('http://127.0.0.1:8000/analytics');
					const data = await res.json();
					if (Array.isArray(data.analytics)) {
						// Filter results by lastWord in type or product_name
						const filtered = data.analytics.filter(item =>
							item.type?.toLowerCase().includes(lastWord) ||
							item.product_name?.toLowerCase().includes(lastWord)
						).map(item => ({
							menuName: item.type,
							eventName: item.product_name,
							link: '/product/' + item.id,
							url: item.img_url || '/placeholder.jpg',
							price: item.price || '',
						}));
						setGridResults(filtered);
					} else {
						setGridResults([]);
					}
				} else {
					setGridResults([]);
				}
			} catch (err) {
				setResponseText("Error fetching Gemini response.");
				setGridResults([]);
			}
			setSearchLoading(false);
		};

		return (
			<div style={{ padding: 20, color: "black" }}>
				{/* Search Bar */}
				<form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
					<input
						type="text"
						value={searchInput}
						onChange={e => setSearchInput(e.target.value)}
						placeholder="Ask Gemini..."
						style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
					/>
					<button type="submit" disabled={searchLoading} style={{ marginLeft: 8, padding: '8px 16px', borderRadius: 4, background: '#4caf50', color: '#fff', border: 'none' }}>
						{searchLoading ? "Searching..." : "Search"}
					</button>
				</form>
				<div style={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: 16, borderRadius: 8, marginTop: 12 }}>
					{responseText}
					<br />
					<div style={{ marginTop: 24 }}>
						{gridResults.length > 0 && (
							<div>
								<h3 style={{ marginBottom: 16 }}>Results for "{gridResults[0]?.menuName || ''}"</h3>
								<div className="tiles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
									{gridResults.map((item, idx) => (
										<div key={idx} className="tile" style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #eee', padding: 12 }}>
											<img src={item.url} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 8 }} />
											<span style={{ display: 'block', fontWeight: 600, marginTop: 8 }}>{item.eventName}</span>
											<div style={{ fontWeight: 600, color: '#1976d2', marginTop: 8 }}>
												{item.price ? `₹${item.price}` : 'Price not available'}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
						{gridResults.length === 0 && (
							<div style={{ color: '#888', marginTop: 16 }}>No results found for the last word.</div>
						)}
					</div>
					<div style={{ marginTop: 16, color: '#1976d2', fontWeight: 600 }}>
						{getLastWord(responseText)}
					</div>
				</div>
			</div>
		);
}
