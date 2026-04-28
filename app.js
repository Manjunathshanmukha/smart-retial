// Common utilities
window.fetchAPI = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }
  return await res.json();
};

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}
