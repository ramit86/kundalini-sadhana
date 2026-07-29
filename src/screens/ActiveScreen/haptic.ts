export function haptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    if ('vibrate' in navigator) {
      const pattern = type === 'light' ? [18] : type === 'medium' ? [35] : [60];
      navigator.vibrate(pattern);
    }
  } catch (_) {}
}
