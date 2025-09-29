import StoreList from '../components/StoreList';

const UserDashboard = () => (
  <div style={{padding:20}}>
    <h2>Stores Available for Rating</h2>
    <StoreList userRole="user" />
  </div>
);

export default UserDashboard;
