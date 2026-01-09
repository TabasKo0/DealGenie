'use client'
import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react'
const HomePage = () => {
  
  const [activeIndex, setActiveIndex] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSport, setSelectedSport] = useState('Cricket');
  const [casinoMenu, setCasinoMenu] = useState([]);
  const [casinoLobby, setCasinoLobby] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
useEffect(() => {
  fetch('http://127.0.0.1:8000/analytics')
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data.analytics)) {
        // Convert "type" into menuName and map fields accordingly
        const formatted = data.analytics.map(item => ({
          menuName: item.type, // like "phone", "laptop", etc.
          eventName: item.product_name,
          link: '/product/' + item.id, // or another route format
          url: item.img_url || '/placeholder.jpg', // assuming you add image URLs,
          price: item.our_price || 'N/A' // assuming you have a price field

        }));
        setCasinoLobby(formatted);
      } else {
        setCasinoLobby([]);
      }
    })
    .catch(error => console.error('Error fetching analytics:', error));
}, []);


    const [activeLink, setActiveLink] = useState('');
    const router = useRouter();

    useEffect(() => {
        setActiveLink(router.pathname);
    }, [router.pathname]);

      const [emblaRef] = useEmblaCarousel()
      
    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };
    const handleLinkClick = (href, imgUrl, price) => {
      setActiveLink('/app/' + href);
      setTimeout(() => { setActiveLink(''); }, 100);
      // Pass img url and price as query params using string URL
      router.push(`/app/${href}?img=${encodeURIComponent(imgUrl)}&price=${encodeURIComponent(price)}`);
    };

    // Search submit handler
    const handleSearchSubmit = async (e) => {
      e.preventDefault();
      if (!searchInput.trim()) return;
      setSearchLoading(true);
      try {
        // Call Gemini API with correct model name
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: (searchInput+".you are the dealgenie. based on the first sentence, recommend products, you may inquire about more specifications ,but keep it brief. do not use any markdown formatting , you may keep bullet points, also read the first sentance and return one of the following keywords at the end you your reply-phone,headphones,laptop,speakers,smart watches") }] }] })
        });
        const result = await response.json();
        // Pass response to search page via router (use query param or localStorage)
        router.push(`/app/search?pageResponse=${encodeURIComponent(JSON.stringify(result))}`);
      } catch (err) {
        alert("Error fetching Gemini response");
      }
      setSearchLoading(false);
    };

 
    return (
      <div>
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', marginBottom: 20 ,color:"black"}}>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="what are you looking for?"
            style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button type="submit" disabled={searchLoading} style={{ marginLeft: 8, padding: '8px 16px', borderRadius: 4, background: '#71b1b9', color: '#fff', border: 'none' }}>
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </form>
      <div className='hidden'>
        <br></br>
        <table className='bgs'>
        <tbody>
        <tr>
          {filteredData.map((item, index) => (
          <td key={index} className='c46'>
            <span>{item.eventName}</span>
            <span className='date'>{new Date(item.eventTime).toLocaleString()}</span>
          </td>
          ))}
        </tr>
        </tbody>
        </table>
      </div>
      <br></br>
      <div >
        <div className='highlights'>Phones</div>
        <div className='tiles'>
        {casinoLobby.filter(item => item.menuName.toLowerCase() === 'phone').map((item, index) => (
          <div key={index} onClick={() => handleLinkClick(item.link, item.url, item.price)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
            <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }} />
            <span>{item.eventName}</span>
            <div style={{ fontWeight: 600, color: '#1976d2', marginTop: 8 }}>
              {item.price ? `₹${item.price}` : 'Price not available'}
            </div>
          </div>
        ))}
        </div>
      </div>
      <br></br>
      <br></br>
      <div className='casinos'>
        <div className='highlights'>Headphones</div>
        <div className='tiles'>
        {casinoLobby.filter(item => item.menuName.toLowerCase() === 'headphones').map((item, index) => (
          <div key={index} onClick={() => handleLinkClick(item.link, item.url, item.price)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
            <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }} />
            <span>{item.eventName}</span>
            <div style={{ fontWeight: 600, color: '#1976d2', marginTop: 8 }}>
              {item.price ? `₹${item.price}` : 'Price not available'}
            </div>
          </div>
        ))}
        </div>
      </div>
      <br></br>
      <br></br>
      <div className='casinos'>
        <div className='highlights'>Laptops</div>
        <div className='tiles'>
        {casinoLobby.filter(item => item.menuName.toLowerCase() === 'laptop').map((item, index) => (
          <div key={index} onClick={() => handleLinkClick(item.link, item.url, item.price)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
            <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }} />
            <span>{item.eventName}</span>
            <div style={{ fontWeight: 600, color: '#1976d2', marginTop: 8 }}>
              {item.price ? `₹${item.price}` : 'Price not available'}
            </div>
          </div>
        ))}
        </div>
      </div>
      <br></br>
      <br></br>
      <div className='casinos'>
        <div className='highlights'>Speakers</div>
        <div className='tiles'>
        {casinoLobby.filter(item => item.menuName.toLowerCase() === 'speakers').map((item, index) => (
          <div key={index} onClick={() => handleLinkClick(item.link, item.url, item.price)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
            <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }} />
            <span>{item.eventName}</span>
            <div style={{ fontWeight: 600, color: '#1976d2', marginTop: 8 }}>
              {item.price ? `₹${item.price}` : 'Price not available'}
            </div>
          </div>
        ))}
        </div>
      </div>
      <br></br>
      <br></br>
      <div className='casinos'>
        <div className='highlights'>Smart Watches</div>
        <div className='tiles'>
        {casinoLobby.filter(item => item.menuName.toLowerCase() === 'smart watches').map((item, index) => (
          <div key={index} onClick={() => handleLinkClick(item.link, item.url, item.price)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
            <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }} />
            <span>{item.eventName}</span>
            <div style={{ fontWeight: 600, color: '#1976d2', marginTop: 8 }}>
              {item.price ? `₹${item.price}` : 'Price not available'}
            </div>
          </div>
        ))}
        </div>
      </div>
      <br></br>
      <br></br>
      </div>
    );
};

export default HomePage;
