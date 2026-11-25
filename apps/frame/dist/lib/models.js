export const MODEL_OPTIONS=[{id:'gpt-6.1-sol',label:'GPT-6.1 Sol'},{id:'gpt-6.1-terra',label:'GPT-6.1 Terra'},{id:'gpt-6-luna',label:'GPT-6.0 Luna'}];
export const DEFAULT_MODEL=MODEL_OPTIONS[0].id;
export const MODEL_EFFORT='high';
export function validateModel(value=DEFAULT_MODEL){
 if(!MODEL_OPTIONS.some(x=>x.id===value))throw Object.assign(new Error('지원하는 모델 중 하나를 선택해 주세요.'),{status:400});
 return value;
}
export function modelLabel(value){return MODEL_OPTIONS.find(x=>x.id===value)?.label||value||'모델 정보 미기록';}
export function modelPicker(selected=DEFAULT_MODEL,name='model'){
 return `<div class="model-picker"><label class="field"><span>분석 모델</span><select name="${name}" aria-label="분석 모델">${MODEL_OPTIONS.map(x=>`<option value="${x.id}" ${x.id===selected?'selected':''}>${x.label}</option>`).join('')}</select></label><div class="model-effort"><span>추론 수준</span><strong>high · 고정</strong></div></div>`;
}
