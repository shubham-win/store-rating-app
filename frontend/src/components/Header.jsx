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
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 2rem',borderBottom:'2px solid #9bd4e2ff'}}>
      <div><Link to="/" style={{textDecoration:'none',color:'#ffcf91ff',fontWeight:'bold', fontSize:'2rem'}}>Store Ratings</Link></div>
      <nav style={{display:'flex',gap:'1rem',alignItems:'center'}}>
        {user ? (
          <>
            <span style={{color:'#f79a22ff',fontWeight:'bold', fontSize:'2rem'}}>Welcome, {user.name }</span>
            <Link to="/update-password" style={{color:'#f1f1f1ff',}}>Update Password</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{textDecoration:'none',color:'#ff9900ff',fontWeight:'bold'}}>Login</Link>
            <Link to="/signup" style={{textDecoration:'none',color:'#ff9900ff',fontWeight:'bold'}}>Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;