import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import UserDashboard from '../pages/UserDashboard';
import StoreOwnerDashboard from '../pages/StoreOwnerDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return <div>Loading...</div>;
  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    case 'user': return <UserDashboard />;
    case 'store_owner': return <StoreOwnerDashboard />;
    default: return <div>Invalid role</div>;
  }
};

export default Dashboard;
