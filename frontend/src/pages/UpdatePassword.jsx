import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UpdatePassword = () => {
  const { api, user } = useAuth();
  const [form, setForm] = useState({ password:'', confirmPassword:'' });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setMessage('Passwords do not match'); return; }
    try {
      let url = '/user/password';
      if (user.role === 'admin') url = '/admin/password';
      if (user.role === 'store_owner') url = '/store-owner/password';
      await api.put(url, { password: form.password });
      setMessage('Password updated');
      setForm({ password:'', confirmPassword:'' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:500,margin:'2rem auto',padding:20,background:'#06060641',borderRadius:8}}>
      <h2>Update Password</h2>
      {message && <div>{message}</div>}
      <div><label>New Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
      <div><label>Confirm Password</label><input type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} required /></div>
      <button type="submit">Update</button>
    </form>
  );
};

export default UpdatePassword;