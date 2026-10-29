/*!
 * Refraction field adapted from liquid-glass-js and the LiquidGlassSkill
 * directive: https://github.com/dashersw/liquid-glass-js and
 * https://github.com/stormaref/LiquidGlassSkill.
 *
 * Copyright (c) 2025 Armagan Amcalar
 * Copyright (c) 2026 Aref Azizian
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Large decorative surfaces only. Repeated controls use the CSS blur fallback.
// The stylesheet applies --glass-refraction only in screen media; without this
// enhancement (or in other engines) its ordinary blur remains in effect.
const selector = '.hero-art, .stats-strip, [data-glass-refraction]';
const preset = {
  edgeIntensity: 0.015, rimIntensity: 0.028, baseIntensity: 0.05,
  edgeDistance: 0.5, rimDistance: 1.7, baseDistance: 0.2,
  cornerBoost: 0.06, rippleEffect: 0.26, blurRadius: 2, warp: false
};
const ns = 'http://www.w3.org/2000/svg';
const reduceTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)');
let instance;

function chromium() {
  // Safari parses SVG URL backdrop filters but does not reliably paint them;
  // feature queries cannot distinguish that case.
  const brands = navigator.userAgentData?.brands;
  return brands ? brands.some(({ brand }) => /Chromium|Google Chrome|Microsoft Edge/i.test(brand))
    : /Chrome\//.test(navigator.userAgent);
}

function buildMap(w, h, radius, pageW, pageH) {
  const ss = Math.max(0.25, Math.min(2, 1400 / Math.max(w, h)));
  const bw = Math.max(1, Math.round(w * ss));
  const bh = Math.max(1, Math.round(h * ss));
  const r = radius * ss;
  const minDim = Math.min(w, h);
  const dx = new Float32Array(bw * bh);
  const dy = new Float32Array(bw * bh);
  let maxAbs = 0;
  for (let py = 0; py < bh; py++) {
    for (let px = 0; px < bw; px++) {
      const cx = (px + 0.5) / bw;
      const cy = (py + 0.5) / bh;
      const tx = Math.abs(px + 0.5 - bw / 2) - (bw / 2 - r);
      const ty = Math.abs(py + 0.5 - bh / 2) - (bh / 2 - r);
      const distance = Math.max(-(Math.hypot(Math.max(tx, 0), Math.max(ty, 0))
        + Math.min(Math.max(tx, ty), 0) - r), 0) / ss;
      const edgeFall = Math.exp(-distance * preset.edgeDistance);
      const rimFall = Math.exp(-distance * preset.rimDistance);
      const baseFall = 1 - Math.exp(-distance * preset.baseDistance);
      const total = (preset.warp ? baseFall * preset.baseIntensity : 0)
        + edgeFall * preset.edgeIntensity + rimFall * preset.rimIntensity;
      let nx = cx - 0.5;
      let ny = cy - 0.5;
      const length = Math.hypot(nx, ny);
      if (length > 0) { nx /= length; ny /= length; }
      const corner = Math.exp(-Math.max(Math.min(cx, 1 - cx), Math.min(cy, 1 - cy))
        * minDim * 0.3) * preset.cornerBoost;
      const ripple = Math.sin((distance / minDim) * 25) * preset.rippleEffect * rimFall;
      const i = py * bw + px;
      dx[i] = (nx * (total + corner) - ny * ripple) * pageW;
      dy[i] = (ny * (total + corner) + nx * ripple) * pageH;
      maxAbs = Math.max(maxAbs, Math.abs(dx[i]), Math.abs(dy[i]));
    }
  }
  const scale = Math.max(maxAbs * 2, 1e-4);
  // Offset the 128/255 decode bias, keeping the undistorted center still.
  const bias = scale * (128 / 255 - 0.5);
  const canvas = document.createElement('canvas');
  canvas.width = bw;
  canvas.height = bh;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  const image = ctx.createImageData(bw, bh);
  for (let i = 0; i < bw * bh; i++) {
    image.data[i * 4] = Math.round(255 * (0.5 + (dx[i] - bias) / scale));
    image.data[i * 4 + 1] = Math.round(255 * (0.5 + (dy[i] - bias) / scale));
    image.data[i * 4 + 2] = 128;
    image.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return { url: canvas.toDataURL('image/png'), scale };
}

function init() {
  if (instance || !chromium() || reduceTransparency.matches || !window.ResizeObserver) return;
  const filters = new Map();
  const surfaces = new Map();
  let defs, svg, frame = 0, resizeTimer, nextId = 0;

  function release(element) {
    const entry = surfaces.get(element);
    if (entry) {
      if (--entry.refs === 0) {
        entry.node.remove();
        if (filters.get(entry.key) === entry) filters.delete(entry.key);
      }
      surfaces.set(element, null);
    }
    element.style.removeProperty('--glass-refraction');
  }

  function acquire(key, w, h, radius, pageW, pageH) {
    let entry = filters.get(key);
    if (entry?.node.isConnected) { entry.refs++; return entry; }
    if (entry) filters.delete(key);
    if (!svg?.isConnected) {
      svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.position = 'fixed';
      defs = document.createElementNS(ns, 'defs');
      svg.append(defs); document.body.append(svg);
    }
    const { url, scale } = buildMap(w, h, radius, pageW, pageH);
    const node = document.createElementNS(ns, 'filter');
    const id = `political-context-glass-${nextId++}`;
    node.setAttribute('id', id);
    const margin = scale / 2 + 3 * preset.blurRadius * 0.35;
    const mx = margin / w * 100, my = margin / h * 100;
    node.setAttribute('x', `${-mx}%`); node.setAttribute('y', `${-my}%`);
    node.setAttribute('width', `${100 + 2 * mx}%`); node.setAttribute('height', `${100 + 2 * my}%`);
    node.setAttribute('color-interpolation-filters', 'sRGB');
    const image = document.createElementNS(ns, 'feImage');
    image.setAttribute('href', url); image.setAttribute('x', '0'); image.setAttribute('y', '0');
    image.setAttribute('width', String(w)); image.setAttribute('height', String(h));
    image.setAttribute('preserveAspectRatio', 'none'); image.setAttribute('result', 'map');
    const displacement = document.createElementNS(ns, 'feDisplacementMap');
    displacement.setAttribute('in', 'SourceGraphic'); displacement.setAttribute('in2', 'map');
    displacement.setAttribute('scale', String(scale)); displacement.setAttribute('xChannelSelector', 'R');
    displacement.setAttribute('yChannelSelector', 'G'); displacement.setAttribute('result', 'displaced');
    const blur = document.createElementNS(ns, 'feGaussianBlur');
    blur.setAttribute('in', 'displaced'); blur.setAttribute('stdDeviation', String(preset.blurRadius * 0.35));
    node.append(image, displacement, blur); defs.append(node);
    entry = { id, key, node, refs: 1 }; filters.set(key, entry); return entry;
  }

  function rebuild(element) {
    const w = Math.round(element.offsetWidth), h = Math.round(element.offsetHeight);
    if (w < 2 || h < 2) { release(element); return; }
    const computed = getComputedStyle(element).borderTopLeftRadius;
    const value = parseFloat(computed) || 0;
    const radius = Math.min(computed.trim().endsWith('%') ? value / 100 * Math.min(w, h) : value, Math.min(w, h) / 2);
    const pageW = window.innerWidth, pageH = window.innerHeight;
    const key = [w, h, radius, pageW, pageH, JSON.stringify(preset)].join('|');
    const current = surfaces.get(element);
    if (current?.key === key && current.node.isConnected) return;
    release(element);
    try {
      const entry = acquire(key, w, h, radius, pageW, pageH);
      surfaces.set(element, entry);
      element.style.setProperty('--glass-refraction', `url(#${entry.id})`);
    } catch {
      // Enhancement is optional: leave the CSS blur intact if canvas fails.
      element.style.removeProperty('--glass-refraction');
    }
  }

  function scan() {
    frame = 0;
    for (const element of surfaces.keys()) {
      if (!element.isConnected || !element.matches(selector)) {
        observer.unobserve(element); release(element); surfaces.delete(element);
      }
    }
    document.querySelectorAll(selector).forEach(element => {
      if (!surfaces.has(element)) { surfaces.set(element, null); observer.observe(element); }
      rebuild(element);
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(scan); }
  const observer = new ResizeObserver(schedule);
  const mutations = new MutationObserver(schedule);
  mutations.observe(document.body, { childList: true, subtree: true });
  function resize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(schedule, 180); }
  window.addEventListener('resize', resize, { passive: true });
  instance = { destroy() {
    observer.disconnect(); mutations.disconnect(); window.removeEventListener('resize', resize);
    clearTimeout(resizeTimer); cancelAnimationFrame(frame);
    for (const element of surfaces.keys()) release(element);
    svg?.remove();
  } };
  schedule();
}

function destroy() { instance?.destroy(); instance = undefined; }
reduceTransparency.addEventListener?.('change', () => { destroy(); init(); });
window.addEventListener('pagehide', destroy);
window.addEventListener('pageshow', init);
init();
