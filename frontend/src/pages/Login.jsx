import { useState } from 'react';
import { api, saveSession } from '../api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const submit = async () => {
    try {
      const { token, user } = await api('/auth/login', 'POST', form);
      saveSession(token, user);
      onLogin(user);
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="login">
      <div className="login-card">
        <h1>Restaurant Desk</h1>
        <p className="muted">Log in to take orders, settle bills or manage the menu.</p>
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {error && <p className="error">{error}</p>}
        <button onClick={submit}>Log in</button>
        <p className="muted small">Demo: admin / admin123 · waiter / waiter123 · biller / biller123</p>
      </div>
    </div>
  );
}
