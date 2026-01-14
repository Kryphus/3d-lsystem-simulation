// Math utility functions
export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function randomFloat(min, max) { return min + Math.random() * (max - min); }
export function degToRad(deg) { return deg * Math.PI / 180; }
export function radToDeg(rad) { return rad * 180 / Math.PI; }
