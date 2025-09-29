import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 2rem',background:'#fff',borderBottom:'1px solid #eee'}}>
      <div><Link to="/" style={{textDecoration:'none',color:'#007bff',fontWeight:'bold'}}>Store Ratings</Link></div>
      <nav style={{display:'flex',gap:'1rem',alignItems:'center'}}>
        {user ? (
          <>
            <span>Welcome, {user.name}</span>
            <Link to="/update-password">Update Password</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;