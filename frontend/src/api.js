export const getToken = () => localStorage.getItem('rms_token');
export const getUser = () => JSON.parse(localStorage.getItem('rms_user') || 'null');
export const saveSession = (token, user) => {
  localStorage.setItem('rms_token', token);
  localStorage.setItem('rms_user', JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem('rms_token');
  localStorage.removeItem('rms_user');
};

export const money = (n) => '₹' + (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// api('/menu'), api('/menu', 'POST', body)
export async function api(path, method = 'GET', body) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { clearSession(); window.location.reload(); }
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
