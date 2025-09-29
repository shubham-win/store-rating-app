import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserList = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name:'', email:'', address:'', role:'' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [editingUser, setEditingUser] = useState(null);
  const [resetPass, setResetPass] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { ...filters, sortBy, sortOrder }});
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(()=>{ fetchUsers(); }, [filters, sortBy, sortOrder]);

  const startEdit = (user) => {
    setEditingUser({ ...user });
    setResetPass('');
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setResetPass('');
  };

  const saveEdit = async () => {
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        address: editingUser.address,
        role: editingUser.role
      });
      if (resetPass) {
        await api.put(`/admin/users/${editingUser.id}/password`, { password: resetPass });
      }
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div style={{padding:20}}>
      <h3>Users</h3>
      <div style={{display:'flex',gap:8,marginBottom:10}}>
        <input placeholder="Name" value={filters.name} onChange={e=>setFilters(f=>({...f,name:e.target.value}))} />
        <input placeholder="Email" value={filters.email} onChange={e=>setFilters(f=>({...f,email:e.target.value}))} />
        <input placeholder="Address" value={filters.address} onChange={e=>setFilters(f=>({...f,address:e.target.value}))} />
        <select value={filters.role} onChange={e=>setFilters(f=>({...f,role:e.target.value}))}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>
      <table style={{width:'100%'}}>
        <thead><tr>
          <th>Name</th>
          <th>Email</th>
          <th>Address</th>
          <th>Role</th>
          <th>Rating</th>
          <th>Actions</th>
        </tr></thead>
        <tbody>
          {users.map(u => (
            editingUser && editingUser.id === u.id ? (
              <tr key={u.id}>
                <td><input value={editingUser.name} onChange={e=>setEditingUser({...editingUser,name:e.target.value})} /></td>
                <td><input value={editingUser.email} onChange={e=>setEditingUser({...editingUser,email:e.target.value})} /></td>
                <td><input value={editingUser.address} onChange={e=>setEditingUser({...editingUser,address:e.target.value})} /></td>
                <td>
                  <select value={editingUser.role} onChange={e=>setEditingUser({...editingUser,role:e.target.value})}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                </td>
                <td>{u.rating || '-'}</td>
                <td>
                  <input placeholder="New password (optional)" type="password" value={resetPass} onChange={e=>setResetPass(e.target.value)} />
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td>{u.role}</td>
                <td>{u.rating || '-'}</td>
                <td>
                  <button onClick={()=>startEdit(u)}>Edit</button>
                  <button onClick={()=>deleteUser(u.id)} style={{marginLeft:6}}>Delete</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
