import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', address:'', password:'', confirmPassword:'' });
  const [error, setError] = useState('');

  const validate = () => {
    if (form.name.length < 20 || form.name.length > 60) return 'Name must be between 20 and 60 characters';
    if (form.password.length < 8 || form.password.length > 16) return 'Password length must be 8-16';
    if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(form.password)) return 'Password must include uppercase and special char';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    try {
      await signup(form.name, form.email, form.password, form.address);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:500,margin:'2rem auto',padding:20,borderRadius:8}}>
      <h2>Sign up</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <div><label>Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder='Name'/></div>
      <div><label>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" required placeholder='Email' /></div>
      <div><label>Address</label><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder='Address'/></div>
      <div><label>Password</label><input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" required placeholder='Password' /></div>
      <div><label>Confirm Password</label><input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" required placeholder='Confirm Password' /></div>
      <button type="submit">Create account</button>
    </form>
  );
};

export default SignupForm;