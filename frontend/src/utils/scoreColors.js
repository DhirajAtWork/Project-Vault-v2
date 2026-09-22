/**
 * Centralized utility to dynamically compute theme styles based on AI Project Health score & grade.
 *
 * Strict Color Mapping Rules:
 * - Score > 70: Green (Emerald)
 * - Score >= 40 and <= 70: Yellow (Amber)
 * - Score < 40: Red (Rose)
 */

export const getScoreStyles = (score, grade) => {
  const num = typeof score === 'number'
    ? score
    : (score !== null && score !== undefined && score !== '' ? Number(score) : null);

  let theme = 'emerald';

  if (num !== null && !isNaN(num)) {
    if (num > 70) {
      theme = 'emerald'; // Green for above 70
    } else if (num >= 40) {
      theme = 'amber';   // Yellow for above or equal to 40
    } else {
      theme = 'rose';    // Red for less than 40
    }
  } else if (grade) {
    const g = String(grade).toUpperCase();
    if (g.includes('A') || g.includes('B')) {
      theme = 'emerald';
    } else if (g.includes('C')) {
      theme = 'amber';
    } else {
      theme = 'rose';
    }
  }

  switch (theme) {
    case 'rose':
      return {
        theme: 'rose',
        banner: 'bg-rose-50 border-rose-300 text-rose-950',
        bannerIcon: 'text-rose-600',
        bannerTime: 'text-rose-700',
        bannerSummary: 'text-rose-900',
        pill: 'bg-rose-500 text-white border-rose-400 font-extrabold',
        text: 'text-rose-700',
        icon: 'text-rose-600',
        badge: 'bg-rose-600 text-white border border-rose-500/50',
      };
    case 'amber':
      return {
        theme: 'amber',
        banner: 'bg-amber-50 border-amber-300 text-amber-950',
        bannerIcon: 'text-amber-600',
        bannerTime: 'text-amber-800',
        bannerSummary: 'text-amber-900',
        pill: 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold',
        text: 'text-amber-700',
        icon: 'text-amber-600',
        badge: 'bg-amber-500 text-slate-950 border border-amber-400/50',
      };
    case 'emerald':
    default:
      return {
        theme: 'emerald',
        banner: 'bg-emerald-50 border-emerald-300 text-emerald-950',
        bannerIcon: 'text-emerald-600',
        bannerTime: 'text-emerald-700',
        bannerSummary: 'text-emerald-900',
        pill: 'bg-emerald-500 text-slate-950 border-emerald-300 font-extrabold',
        text: 'text-emerald-700',
        icon: 'text-emerald-600',
        badge: 'bg-emerald-600 text-white border border-emerald-500/50',
      };
  }
};
