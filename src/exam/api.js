export async function api(path, options = {}) {
  const raw = options.body instanceof Blob;
  const response = await fetch(`/api${path}`, {
    ...options, credentials: 'same-origin',
    headers: { ...(options.body && !raw ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    body: options.body && !raw ? JSON.stringify(options.body) : options.body,
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || 'Ошибка запроса'), { status: response.status });
  return data;
}
export const post = (path, body = {}) => api(path, { method: 'POST', body });
export const timeLabel = seconds => {
  const n = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(n / 3600)).padStart(2, '0')}:${String(Math.floor(n % 3600 / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
};
export const dateLabel = value => value ? new Date(value).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// getRandomValues also works on an HTTP LAN page, so it can display the HTTPS guidance.
export function randomId() {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
