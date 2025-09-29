import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RatingForm from './RatingForm';

const StoreList = ({ userRole }) => {
  const { api } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [editing, setEditing] = useState(null);
  const [owners, setOwners] = useState([]);

  const fetchStores = async () => {
    try {
      const url = userRole === 'admin' ? '/admin/stores' : '/user/stores';
      const res = await api.get(url, { params: { search, sortBy, sortOrder }});
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await api.get('/admin/users', { params: { role: 'store_owner' }});
      setOwners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchStores(); if (userRole==='admin') fetchOwners(); }, [search, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const startEdit = (s) => setEditing({ ...s });
  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    try {
      await api.put(`/admin/stores/${editing.id}`, {
        name: editing.name,
        email: editing.email,
        address: editing.address,
        owner_id: editing.owner_id
      });
      setEditing(null);
      fetchStores();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update store');
    }
  };

  const deleteStore = async (id) => {
    if (!confirm('Delete store? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/stores/${id}`);
      fetchStores();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div style={{padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>Stores</h2>
        <input placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <table border={2} cellPadding={6} style={{width:'100%',borderCollapse:'collapse',marginTop:10, textAlign:'center'}}>
        <thead><tr>
          <th onClick={()=>toggleSort('name')}>Name</th>
          <th onClick={()=>toggleSort('email')}>Email</th>
          <th onClick={()=>toggleSort('address')}>Address</th>
          <th>Average Rating</th>
          {userRole==='user' && <th>Your Rating</th>}
          {userRole==='user' && <th>Actions</th>}
          {userRole==='admin' && <th>Owner</th>}
          {userRole==='admin' && <th>Admin Actions</th>}
        </tr></thead>
        <tbody>
          {stores.map(s => (
            editing && editing.id === s.id ? (
              <tr key={s.id}>
                <td><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></td>
                <td><input value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})} /></td>
                <td><input value={editing.address} onChange={e=>setEditing({...editing,address:e.target.value})} /></td>
                <td>{s.average_rating || 'No ratings'}</td>
                {userRole==='admin' && <>
                  <td>
                    <select value={editing.owner_id} onChange={e=>setEditing({...editing,owner_id:e.target.value})}>
                      <option value="">Select owner</option>
                      {owners.map(o=> <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                    </select>
                  </td>
                  <td>
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit} style={{marginLeft:6}}>Cancel</button>
                  </td>
                </>}
              </tr>
            ) : (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>{s.average_rating || 'No ratings'}</td>
                {userRole==='user' && <>
                  <td>{s.user_rating || 'Not rated'}</td>
                  <td><RatingForm storeId={s.id} onRatingSubmit={fetchStores} /></td>
                </>}
                {userRole==='admin' && <>
                  <td>{s.owner_name}</td>
                  <td>
                    <button onClick={()=>startEdit(s)}>Edit</button>
                    <button onClick={()=>deleteStore(s.id)} style={{marginLeft:6}}>Delete</button>
                  </td>
                </>}
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StoreList;
