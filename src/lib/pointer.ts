// Shared pointer position so every Pip on screen can look at the visitor
// without causing React re-renders.
export const pointer = { x: -1, y: -1, active: false, lastMove: 0 };

let installed = false;
export function installPointerTracking() {
  if (installed) return;
  installed = true;
  const update = (x: number, y: number) => {
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
    pointer.lastMove = performance.now();
  };
  window.addEventListener('pointermove', (e) => update(e.clientX, e.clientY), { passive: true });
  window.addEventListener('pointerdown', (e) => update(e.clientX, e.clientY), { passive: true });
  document.addEventListener('pointerleave', () => {
    pointer.active = false;
  });
}

// When something is hovered (e.g. a desktop icon), Pip looks at it.
export const lookTarget: { el: HTMLElement | null } = { el: null };
