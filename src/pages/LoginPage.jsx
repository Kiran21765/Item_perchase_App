import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { data } = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', form);
      login(data);
      navigate('/');
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <div className="brand">
          <span className="logo"><Icon name="inventory" size={20} /></span>
          <span>Invento</span>
        </div>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <p className="muted">
          {mode === 'login' ? 'Log in to manage items and purchases' : 'New accounts get the USER role'}
        </p>
        <Alert msg={msg} />
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={form.username}
            autoComplete="username"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn primary" type="submit" disabled={busy}>
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
        <button
          type="button"
          className="link-btn"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMsg(null); }}
        >
          {mode === 'login' ? 'No account? Register (USER role)' : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
}