/**
 * Centralized utility to dynamically compute theme styles based on AI Project Health score & grade.
 *
 * Color Mapping:
 * - Score >= 85 (Grade A / A+): Emerald Green (Superior, Production-Ready)
 * - Score 70 - 84 (Grade B / B+): Modern Tech Blue (Solid, Competent Architecture)
 * - Score 50 - 69 (Grade C / C+): Amber / Orange (Moderate, In Progress, Needs Polish)
 * - Score < 50 (Grade D / F / Partial / Stub): Rose / Red (Critical Warning, Incomplete Scaffold)
 */

export const getScoreStyles = (score, grade) => {
  const num = typeof score === 'number'
    ? score
    : (score !== null && score !== undefined && score !== '' ? Number(score) : null);

  let theme = 'emerald';

  if (num !== null && !isNaN(num)) {
    if (num >= 85) theme = 'emerald';
    else if (num >= 70) theme = 'blue';
    else if (num >= 50) theme = 'amber';
    else theme = 'rose';
  } else if (grade) {
    const g = String(grade).toUpperCase();
    if (g.includes('A')) theme = 'emerald';
    else if (g.includes('B')) theme = 'blue';
    else if (g.includes('C')) theme = 'amber';
    else theme = 'rose';
  }

  switch (theme) {
    case 'rose':
      return {
        theme: 'rose',
        banner: 'bg-rose-50 border-rose-200/90 text-rose-950',
        bannerIcon: 'text-rose-600',
        bannerTime: 'text-rose-700',
        bannerSummary: 'text-rose-900/90',
        pill: 'bg-rose-500 text-white border-rose-300',
        text: 'text-rose-700',
        icon: 'text-rose-600',
        badge: 'bg-rose-600 text-white border border-rose-500/50',
      };
    case 'amber':
      return {
        theme: 'amber',
        banner: 'bg-amber-50 border-amber-200/90 text-amber-950',
        bannerIcon: 'text-amber-600',
        bannerTime: 'text-amber-800',
        bannerSummary: 'text-amber-900/90',
        pill: 'bg-amber-400 text-slate-950 border-amber-300',
        text: 'text-amber-700',
        icon: 'text-amber-600',
        badge: 'bg-amber-500 text-slate-950 border border-amber-400/50',
      };
    case 'blue':
      return {
        theme: 'blue',
        banner: 'bg-blue-50 border-blue-200/90 text-blue-950',
        bannerIcon: 'text-blue-600',
        bannerTime: 'text-blue-700',
        bannerSummary: 'text-blue-900/90',
        pill: 'bg-blue-600 text-white border-blue-400',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        badge: 'bg-blue-600 text-white border border-blue-500/50',
      };
    case 'emerald':
    default:
      return {
        theme: 'emerald',
        banner: 'bg-emerald-50 border-emerald-200/90 text-emerald-950',
        bannerIcon: 'text-emerald-600',
        bannerTime: 'text-emerald-700',
        bannerSummary: 'text-emerald-900/90',
        pill: 'bg-emerald-500 text-slate-950 border-emerald-300',
        text: 'text-emerald-700',
        icon: 'text-emerald-600',
        badge: 'bg-emerald-600 text-white border border-emerald-500/50',
      };
  }
};
