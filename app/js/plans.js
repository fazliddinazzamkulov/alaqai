/* Plans and limits. These are the defaults; the admin can override them
 * (settings.plans) without code changes, and the server is the one that
 * actually counts and enforces AI usage once accounts are connected. */
import { add, t } from './i18n.js';
import { db } from './data/store.js';
import { today, weekStart } from './school.js';

add({
  ru: { 'plan.basic': 'Базовый', 'plan.standard': 'Стандарт', 'plan.max': 'Max', 'plan.school': 'Для школ',
        'plan.used': 'использовано {p}%', 'plan.usedOf': '{n} из {max}', 'plan.unlimited': 'без ограничений', 'plan.noAi': 'ИИ — в Стандарте' },
  kk: { 'plan.basic': 'Базалық', 'plan.standard': 'Стандарт', 'plan.max': 'Max', 'plan.school': 'Мектептерге',
        'plan.used': '{p}% пайдаланылды', 'plan.usedOf': '{max}-дан {n}', 'plan.unlimited': 'шектеусіз', 'plan.noAi': 'ЖИ — Стандартта' },
  en: { 'plan.basic': 'Basic', 'plan.standard': 'Standard', 'plan.max': 'Max', 'plan.school': 'For schools',
        'plan.used': '{p}% used', 'plan.usedOf': '{n} of {max}', 'plan.unlimited': 'unlimited', 'plan.noAi': 'AI comes with Standard' }
});

export const DEFAULT_PLANS = {
  basic:    { priceMonth: 0,    price6: 0,     aiLessonsPerWeek: 0,    openLessonAgentPerMonth: 0, lessonAnalysis: false, homeworkAnalysis: false, kspWord: false, proGames: false },
  standard: { priceMonth: 4990, price6: 25900, aiLessonsPerWeek: 20,   openLessonAgentPerMonth: 0, lessonAnalysis: true,  homeworkAnalysis: true,  kspWord: true,  proGames: true },
  max:      { priceMonth: 9990, price6: 49900, aiLessonsPerWeek: null, openLessonAgentPerMonth: 4, lessonAnalysis: true,  homeworkAnalysis: true,  kspWord: true,  proGames: true, prepAgent: true },
  school:   { priceMonth: null, price6: null,  aiLessonsPerWeek: null, openLessonAgentPerMonth: 4, lessonAnalysis: true,  homeworkAnalysis: true,  kspWord: true,  proGames: true, prepAgent: true }
};

export async function currentPlan() {
  const s = await db.settings.get();
  const plans = { ...DEFAULT_PLANS, ...(s.plans || {}) };
  // Signed in: the server's record decides the plan ('free' is the server's old name for Basic).
  const u = window.Alaqai && window.Alaqai.getCachedUser && window.Alaqai.getCachedUser();
  const fromServer = u && u.subscriptionStatus !== 'expired' ? ({ free: 'basic' }[u.subscriptionPlan] || u.subscriptionPlan) : null;
  const id = fromServer && plans[fromServer] ? fromServer : s.plan || 'basic';
  return { id, name: t('plan.' + id), ...plans[id] };
}

/** AI lessons used this week and the weekly limit (null = unlimited). */
export async function weeklyUsage() {
  const plan = await currentPlan();
  const from = weekStart(today());
  const used = (await db.usage.list(u => u.kind === 'ai-lesson' && u.at.slice(0, 10) >= from)).length;
  const max = plan.aiLessonsPerWeek;
  return { plan, used, max, percent: max ? Math.min(100, Math.round(used / max * 100)) : 0 };
}
