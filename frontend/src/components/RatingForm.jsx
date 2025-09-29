import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RatingForm = ({ storeId, onRatingSubmit }) => {
  const { api } = useAuth();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) { setMessage('Select rating 1-5'); return; }
    try {
      await api.post(`/user/stores/${storeId}/rating`, { rating });
      setMessage('Submitted');
      setRating(0);
      if (onRatingSubmit) onRatingSubmit();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <form onSubmit={submit} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <div style={{display:'flex',gap:6}}>
        {[1,2,3,4,5].map(s => (
          <label key={s} style={{cursor:'pointer'}}>
            <input type="radio" name="rating" value={s} checked={rating===s} onChange={()=>setRating(s)} style={{display:'none'}} />
            <span style={{fontSize:20,color:s<=rating? '#ffc107':'#e4e5e9'}}>★</span>
          </label>
        ))}
      </div>
      <button type="submit">Rate</button>
      {message && <div>{message}</div>}
    </form>
  );
}; 

export default RatingForm;