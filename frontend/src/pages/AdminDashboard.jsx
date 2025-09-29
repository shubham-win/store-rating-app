import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StoreList from '../components/StoreList';
import UserList from '../components/UserList';

const AdminDashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [userForm, setUserForm] = useState({ name:'', email:'', password:'', address:'', role:'user' });
  const [storeForm, setStoreForm] = useState({ name:'', email:'', address:'', owner_id:'' });
  const [owners, setOwners] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await api.get('/admin/users', { params: { role: 'store_owner' }});
      setOwners(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(()=>{ fetchStats(); fetchOwners(); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', userForm);
      setUserForm({ name:'', email:'', password:'', address:'', role:'user' });
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const createStore = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/stores', storeForm);
      setStoreForm({ name:'', email:'', address:'', owner_id:'' });
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create store');
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>Admin Dashboard</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      {stats && (
        <div style={{display:'flex',gap:10,marginBottom:20}}>
          <div style={{padding:10,background:'#fff',borderRadius:8}}>Total Users: {stats.totalUsers}</div>
          <div style={{padding:10,background:'#fff',borderRadius:8}}>Total Stores: {stats.totalStores}</div>
          <div style={{padding:10,background:'#fff',borderRadius:8}}>Total Ratings: {stats.totalRatings}</div>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div style={{background:'#fff',padding:10,borderRadius:8}}>
          <h3>Create User</h3>
          <form onSubmit={createUser} style={{display:'flex',flexDirection:'column',gap:8}}>
            <input placeholder="Name" value={userForm.name} onChange={e=>setUserForm({...userForm,name:e.target.value})} required />
            <input placeholder="Email" type="email" value={userForm.email} onChange={e=>setUserForm({...userForm,email:e.target.value})} required />
            <input placeholder="Address" value={userForm.address} onChange={e=>setUserForm({...userForm,address:e.target.value})} />
            <select value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
            <input placeholder="Password" type="password" value={userForm.password} onChange={e=>setUserForm({...userForm,password:e.target.value})} required />
            <button type="submit">Create User</button>
          </form>
        </div>

        <div style={{background:'#fff',padding:10,borderRadius:8}}>
          <h3>Create Store</h3>
          <form onSubmit={createStore} style={{display:'flex',flexDirection:'column',gap:8}}>
            <input placeholder="Store Name" value={storeForm.name} onChange={e=>setStoreForm({...storeForm,name:e.target.value})} required />
            <input placeholder="Email" type="email" value={storeForm.email} onChange={e=>setStoreForm({...storeForm,email:e.target.value})} />
            <input placeholder="Address" value={storeForm.address} onChange={e=>setStoreForm({...storeForm,address:e.target.value})} />
            <select value={storeForm.owner_id} onChange={e=>setStoreForm({...storeForm,owner_id:e.target.value})} required>
              <option value="">Select owner</option>
              {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
            </select>
            <button type="submit">Create Store</button>
          </form>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginTop:20}}>
        <div style={{background:'#fff',padding:10,borderRadius:8}}>
          <h3>Stores</h3>
          <StoreList userRole="admin" />
        </div>
        <div style={{background:'#fff',padding:10,borderRadius:8}}>
          <h3>Users</h3>
          <UserList />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
