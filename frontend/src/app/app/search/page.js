
"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchPage() {
		const searchParams = useSearchParams();
		const initialResponse = searchParams.get('pageResponse');
		const [searchInput, setSearchInput] = useState("");
		const [searchLoading, setSearchLoading] = useState(false);
		const [responseText, setResponseText] = useState("");

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
				const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=YOUR_API_KEY", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ contents: [{ parts: [{ text: searchInput }] }] })
				});
				const result = await response.json();
				setResponseText(result?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(result));
			} catch (err) {
				setResponseText("Error fetching Gemini response.");
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
                    <br></br>
                    Here are a few results based on your search;
				</div>
			</div>
		);
}