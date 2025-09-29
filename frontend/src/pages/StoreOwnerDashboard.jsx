import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const StoreOwnerDashboard = () => {
  const { api } = useAuth();
  const [data, setData] = useState({ stores: [], ratings: [] });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/store-owner/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch');
    }
  };

  useEffect(()=>{ fetchData(); }, []);

  return (
    <div style={{padding:20}}>
      <h2>Your Store(s)</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      {data.stores.map(s => (
        <div key={s.id} style={{padding:10,background:'#fff',marginBottom:10,borderRadius:8}}>
          <h3>{s.name}</h3>
          <p>Average Rating: {s.average_rating || 'No ratings'}</p>
        </div>
      ))}
      <h3>Ratings</h3>
      {data.ratings.length===0 ? <p>No ratings yet</p> : (
        <table style={{width:'100%'}}>
          <thead><tr><th>User</th><th>Email</th><th>Rating</th><th>Date</th></tr></thead>
          <tbody>
            {data.ratings.map(r => (
              <tr key={r.id}>
                <td>{r.user_name}</td>
                <td>{r.user_email}</td>
                <td>{r.rating}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
