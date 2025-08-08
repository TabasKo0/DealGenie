'use client'

import { useEffect, useState } from 'react';
import CartPage from '../cart/page.js';
const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch('/api/auth/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'value' }) // Adjust the body as needed
            });
            const data = await res.json();
            
            console.log(data.user)
            setUser(data.user);
        };

        const fetchTransactions = async () => {
            const res = await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            
            console.log(data.trans)
            setTransactions(data.trans.reverse());
        };

        fetchProfile();
        fetchTransactions();
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{color: 'black',fontSize: 'X-large'}}>
           
            <h1 className="highlights" style={{color: 'white'}}> Profile Page</h1>
            
          <br></br>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <div style={{color: 'black',fontSize: 'X-large'}}>      
                
                <div><span>&nbsp;Username:</span><span> {user.username}</span></div>
                <div><span>&nbsp;Balance:</span><span> Rs {user.balance}</span></div>
            </div>
            <div style={{ marginTop: '20px', fontSize: 'large',backgroundColor: 'rgba(218, 255, 221, 0.92)', padding: '5px', borderRadius: '5px' }}>
             <div style={{backgroundColor: 'rgba(241, 241, 241, 0.92)', padding: '10px', borderRadius: '5px' }}>
                <CartPage username={user.username} /></div>
                </div>
           
            </div>
            <div style={{ marginTop: '20px', fontSize: 'x-large',backgroundColor: 'rgba(218, 255, 221, 0.92)', padding: '8px', borderRadius: '5px' }}>
              <b>  <h2 >Transactions</h2></b>
              <div style={{backgroundColor: 'rgba(241, 241, 241, 0.92)', padding: '10px', borderRadius: '5px' }}>
                {transactions.length > 0 ? (
                    <table className='trans'>
                        <thead className='header'>
                            <tr>
                                <th>SL No</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr key={index} className={transaction.type === 'deposit' ? 'deposit' : 'withdraw'}>
                                    <td className="sl" data-label="SL No">{index + 1}</td>
                                    <td data-label="Amount">{transaction.amount}</td>
                                    <td data-label="Type">{transaction.type}</td>
                                    <td data-label="Date">{new Date(transaction.date).toLocaleString()}</td>
                                    <td data-label="Remarks">{transaction.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <span>&nbsp; No transactions available.</span>
                )}</div>
            </div>
             <button onClick={async () => {
               
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                window.location.href = '/'; // Redirect to login page after logout
            }} style={{ marginTop: '20px', padding: '10px 20px', fontSize: 'large' ,backgroundColor: 'rgba(255, 142, 142, 0.92)', borderRadius: '5px', cursor: 'pointer', color: 'black', border: 'none' }}>
                Logout
            </button>
        </div>
    );
};

export default ProfilePage;