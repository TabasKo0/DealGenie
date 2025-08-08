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
useEffect(() => {
  fetch('http://172.16.41.210:8000/analytics')
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
    const handleLinkClick = (href, imgUrl) => {
      setActiveLink('/app/' + href);
      setTimeout(() => { setActiveLink(''); }, 100);
      // Pass img url as query param using string URL
      router.push(`/app/${href}?img=${encodeURIComponent(imgUrl)}`);
    };

    useEffect(() => {
        fetch('https://www.55sport.in/api/exchange/events/searchEventList?key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: '' })
        })
            .then(response => response.json())
            .then(data => {
                setData(data.data);
                setFilteredData(data.data.filter(item => item.sportName === 'Cricket'));
                console.log(data);
            })
            .catch(error => console.error('Error fetching data:', error));


    }, []);

    const filterData = (sportName) => {
        setSelectedSport(sportName);
        setFilteredData(data.filter(item => item.sportName === sportName));
    };

    return (
      <div>
      <img src="/banner.jpg" className='banner' alt="Banner"  />

      <div className='hidden'>
        <br></br>
        <div className='p-1 submenu'>
        <span onClick={() => filterData('Cricket')} className={selectedSport === 'Cricket' ? 'active' : ''}>Cricket</span>
        <span onClick={() => filterData('Soccer')} className={selectedSport === 'Soccer' ? 'active' : ''}>Soccer</span>
        <span onClick={() => filterData('Tennis')} className={selectedSport === 'Tennis' ? 'active' : ''}>Tennis</span>
        </div>
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
      <div className='casinos'>
        <div className='highlights'>Phones</div>
        <div className='tiles'>
        {casinoLobby.filter(item => item.menuName.toLowerCase() === 'phone').map((item, index) => (
          <div key={index} onClick={() => handleLinkClick(item.link, item.url)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
          <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }} /> <span>{item.eventName}</span>
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
          <div key={index} onClick={() => handleLinkClick(item.link, item.url)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
          <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }}/> <span>{item.eventName}</span>
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
          <div key={index} onClick={() => handleLinkClick(item.link, item.url)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
          <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }} /> <span>{item.eventName}</span>
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
          <div key={index} onClick={() => handleLinkClick(item.link, item.url)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
          <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }} /> <span>{item.eventName}</span>
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
          <div key={index} onClick={() => handleLinkClick(item.link, item.url)} className={`tile ${item.link=='/notworking/home'?'disabled':''}`}>
          <img src={item.url} style={{ width: '100%', height: '30vh', objectFit: 'cover' }} /> <span>{item.eventName}</span>
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
