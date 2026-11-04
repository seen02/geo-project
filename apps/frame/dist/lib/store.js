export async function api(url, options = {}) {
  const response = await fetch(url, { cache:'no-store', ...options,
    headers: { ...(options.body ? {'Content-Type':'application/json'} : {}), ...options.headers } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || '로컬 서버 요청에 실패했습니다.');
  return result;
}
export const allRequests = () => api('/api/requests');
export const getRequest = id => api('/api/requests/'+encodeURIComponent(id));
export const saveRequest = value => api('/api/requests/'+encodeURIComponent(value.id), { method:'PUT', body:JSON.stringify(value) });
export const removeRequest = id => api('/api/requests/'+encodeURIComponent(id), { method:'DELETE' });
export async function createRequest(value) {
  const reference = { ...value.reference };
  if (!reference.dataUrl) {
    const response = await fetch(reference.url);
    if (!response.ok) throw new Error('레퍼런스 사진을 읽지 못했습니다.');
    const blob = await response.blob();
    reference.dataUrl = await new Promise((resolve,reject) => { const reader=new FileReader(); reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob); });
  }
  return api('/api/requests',{ method:'POST',body:JSON.stringify({...value,reference}) });
}
