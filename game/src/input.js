// gilded-trust: input — keyboard and mouse, with one-shot key edges for tools.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0 };
    this.whistle = 0;
    addEventListener('keydown', (e) => {
      if (!e.repeat) {
        this.keys.add(e.code);
        this.pressed.add(e.code);
        if (e.code === 'KeyE') this.whistle = 6;
      }
      if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
    });
  }
  has(code) { return this.keys.has(code); }
  // one frame per physical press
  takeKey(code) { if (this.pressed.has(code)) { this.pressed.delete(code); return true; } return false; }
  takeWhistle() { if (this.whistle > 0) { this.whistle--; return true; } return false; }
  endFrame() { this.pressed.clear(); }
}
