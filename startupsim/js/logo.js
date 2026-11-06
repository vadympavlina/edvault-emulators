// Симулятор стартапу · знак компанії: форма, колір чи градієнт і символ. Використовується у вправі й у шапці гри.
import { icon } from './icons.js';

const CLIP = { hex: 'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%)', shield: 'polygon(0 0,100% 0,100% 55%,50% 100%,0 55%)', diamond: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' };
const RADIUS = { circle: '50%', squircle: '28%' };
// m = { shape, c1, c2, fg, sym }
export function logoMark(m, size = 36, sym) {
  const bg = m.c2 ? `linear-gradient(140deg, ${m.c1}, ${m.c2})` : m.c1, k = CLIP[m.shape] ? .44 : .54;
  return `<span class="lgm" style="width:${size}px;height:${size}px;background:${bg};border-radius:${RADIUS[m.shape] || 0};${CLIP[m.shape] ? `clip-path:${CLIP[m.shape]};` : ''}color:${m.fg}">${icon(sym || m.sym, Math.round(size * k))}</span>`;
}
