import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
  return (
    <form onSubmit={handleSubmit} style={{maxWidth:400,margin:'2rem auto',padding:20,background:'#fff',borderRadius:8}}>
      <h2>Login</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <div>
        <label>Email</label>
        <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" required />
      </div>
      <div>
        <label>Password</label>
        <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}; 

export default LoginForm;