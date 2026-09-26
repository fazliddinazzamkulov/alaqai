/* AI client. Every call goes to the alaqai server (server/src/routes/ai.js),
 * which holds the Gemini keys — the browser never sees a key. */
import { add, t } from './i18n.js';

add({
  ru: {
    'ai.err.login': 'Чтобы работать с ИИ, войдите в аккаунт.',
    'ai.err.plan': 'На вашем тарифе ИИ недоступен или лимит на эту неделю исчерпан.',
    'ai.err.nokeys': 'ИИ временно недоступен: администратор ещё не добавил ключи.',
    'ai.err.offline': 'Нет связи с сервером alaqai. Проверьте интернет и попробуйте ещё раз.',
    'ai.err.blocked': 'Запрос остановил фильтр безопасности. Переформулируйте тему.',
    'ai.err.bad': 'ИИ вернул неполный ответ. Попробуйте ещё раз.',
    'ai.err.other': 'Не получилось: {msg}'
  },
  kk: {
    'ai.err.login': 'ЖИ-мен жұмыс істеу үшін аккаунтқа кіріңіз.',
    'ai.err.plan': 'Тарифіңізде ЖИ жоқ немесе осы аптаның лимиті таусылды.',
    'ai.err.nokeys': 'ЖИ уақытша қолжетімсіз: әкімші кілттерді әлі қоспаған.',
    'ai.err.offline': 'alaqai серверімен байланыс жоқ. Интернетті тексеріп, қайталап көріңіз.',
    'ai.err.blocked': 'Сұрауды қауіпсіздік сүзгісі тоқтатты. Тақырыпты басқаша жазыңыз.',
    'ai.err.bad': 'ЖИ толық емес жауап берді. Қайталап көріңіз.',
    'ai.err.other': 'Болмады: {msg}'
  },
  en: {
    'ai.err.login': 'Sign in to use AI.',
    'ai.err.plan': 'AI is not included in your plan, or this week’s limit is used up.',
    'ai.err.nokeys': 'AI is temporarily unavailable: the administrator has not added keys yet.',
    'ai.err.offline': 'Can’t reach the alaqai server. Check your connection and try again.',
    'ai.err.blocked': 'The safety filter stopped this request. Try wording the topic differently.',
    'ai.err.bad': 'The AI returned an incomplete answer. Please try again.',
    'ai.err.other': 'Something went wrong: {msg}'
  }
});

// School platform: strict filters for sexual and dangerous content.
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
];

export class AiError extends Error {
  constructor(code, message) { super(message || t('ai.err.' + code)); this.code = code; }
}

const base = () => (window.Alaqai && window.Alaqai.API_BASE) || window.ALAQAI_API_BASE || '';

async function post(path, body) {
  let res;
  try {
    res = await fetch(base() + path, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch (e) {
    throw new AiError('offline');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new AiError('login');
    if (res.status === 402 || res.status === 403) throw new AiError('plan');
    if (data && data.error === 'no_api_keys') throw new AiError('nokeys');
    const msg = (data && (data.message || (data.error && data.error.message))) || 'HTTP ' + res.status;
    throw new AiError('other', t('ai.err.other', { msg }));
  }
  return data;
}

/**
 * Ask Gemini for JSON. `files` are [{ mimeType, base64 }] — textbook photos or PDFs.
 */
export async function generateJSON(prompt, { files = [], temperature = 0.7 } = {}) {
  const parts = [{ text: prompt }];
  files.forEach(f => parts.push({ inline_data: { mime_type: f.mimeType, data: f.base64 } }));
  const data = await post('/api/ai/generate', {
    contents: [{ parts }],
    generationConfig: { responseMimeType: 'application/json', temperature },
    safetySettings: SAFETY_SETTINGS
  });
  if (data.promptFeedback && data.promptFeedback.blockReason) throw new AiError('blocked');
  const cand = data.candidates && data.candidates[0];
  const text = cand && cand.content && cand.content.parts ? cand.content.parts.map(p => p.text || '').join('') : '';
  if (!text) throw new AiError(cand && cand.finishReason === 'SAFETY' ? 'blocked' : 'bad');
  const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned); } catch (e) { throw new AiError('bad'); }
}

/** Stock photo URL for an English query (Pexels → Unsplash → Pixabay on the server), or null. */
export async function searchImage(query) {
  try {
    const res = await fetch(base() + '/api/images/search?q=' + encodeURIComponent(query), { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.url || null;
  } catch (e) { return null; }
}

/** AI-generated image as a data: URL (Gemini image model on the server). */
export async function generateImage(prompt) {
  const data = await post('/api/ai/generate-image', { prompt });
  return data.dataUrl || null;
}

/** Lucide line icon from Iconify (no key needed). */
export function iconUrl(name, color = '16170F') {
  const safe = String(name || 'sparkles').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `https://api.iconify.design/lucide:${safe}.svg?color=%23${color}`;
}

/** Read a File into { mimeType, base64, name } for generateJSON. */
export function fileToPart(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve({ name: file.name, mimeType: file.type || 'application/octet-stream', base64: String(r.result).split(',')[1] });
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
