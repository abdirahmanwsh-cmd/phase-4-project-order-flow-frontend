import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('Submitting registration for:', { username, email });

    try {
      const success = await register(username, email, password);

      setLoading(false);

      if (success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Registration failed. Check console for details or try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('Network error. Please check if the backend is running.');
      console.error('Registration submission error:', err);
    }
  };

  return (
    <div className="hero-section">
      <div className="hero-content" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 className="hero-title">Create Account</h1>
        <p className="hero-subtitle">Join Order Flow and start ordering</p>

        {error && <p style={{ color: '#ff4d4f', margin: '1rem 0', fontWeight: 'bold' }}>{error}</p>}
        {success && <p style={{ color: '#2d6a4f', margin: '1rem 0', fontWeight: 'bold' }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              margin: '12px 0',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              margin: '12px 0',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              margin: '12px 0',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          <button 
            type="submit" 
            className="hero-btn" 
            disabled={loading}
            style={{ width: '100%', marginTop: '20px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#fff', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}