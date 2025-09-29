import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <form onSubmit={handleSubmit} style={{maxWidth:600,margin:'2rem auto',padding:20,borderRadius:8}}>
      <h2>Login</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <div>
        <label>Email</label>
        <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" placeholder='Email' required />
      </div>
      <div>
        <label>Password</label>
        <div style={{display:'flex',flexDirection:'row'}}>
          <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type={showPassword ? "text" : "password"} placeholder='Password' required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{marginLeft:10}}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

      </div>
      <button type="submit">Login</button>
    </form>
  );
}; 

export default LoginForm;