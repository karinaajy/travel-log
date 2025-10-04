const apiBaseFromEnv = import.meta.env.VITE_API_URL?.trim();
const API_URL = apiBaseFromEnv || (window.location.hostname === 'localhost' ? 'http://localhost:1337' : 'https://travel-log-api.now.sh');

export async function listLogEntries() {
  const response = await fetch(`${API_URL}/api/logs`);
  return response.json();
}

export async function createLogEntry(entry) {
  let apiKey;
  let body;
  let headers = {};

  // 检查是否是FormData（文件上传）
  if (entry instanceof FormData) {
    apiKey = entry.get('apiKey');
    entry.delete('apiKey');
    body = entry;
    // FormData不需要设置content-type，浏览器会自动设置
  } else {
    // 普通JSON数据
    apiKey = entry.apiKey;
    delete entry.apiKey;
    headers['content-type'] = 'application/json';
    body = JSON.stringify(entry);
  }

  const response = await fetch(`${API_URL}/api/logs`, {
    method: 'POST',
    headers: {
      ...headers,
      'X-API-KEY': apiKey, 
    },
    body,
  });
  let json;
  if (response.headers.get('content-type').includes('text/html')) {
    const message = await response.text();
    json = {
      message,
    };
  } else {
    json = await response.json();
  }
  if (response.ok) {
    return json;
  }
  const error = new Error(json.message);
  error.response = json;
  throw error;
}
