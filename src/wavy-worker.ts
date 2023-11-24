import { SpriteSheet } from './spritesheet';
import { Wavy } from './wavy';

let wavy: Wavy;

self.onmessage = (ev) => {
  if(ev.data.msg === 'init') {
    const spriteSheet = new SpriteSheet(ev.data.spriteImage);
    wavy = new Wavy(ev.data.canvas, self, spriteSheet);
  }

  if (ev.data.msg === 'step') {
    wavy.wavy(ev.data.constraints, false);
  }

  if (ev.data.msg === 'run') {
    wavy.wavy(ev.data.constraints, true);
  }

  if (ev.data.msg === 'reset') {
    wavy.resetBoard();
  }
}
