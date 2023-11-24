import pipeConstraints from './pipe-constraints.json';
import sampleBoard from './sample.json';
import { deriveConstraints } from './constraints';
import { Tile, Wavy } from './wavy';
import { SpriteSheet } from './spritesheet';

const TILE_SPRITESHEET_URL = new URL('pipe-tileset.png', import.meta.url);

const outputCanvas = document.querySelector('#output-canvas') as HTMLCanvasElement;
const nextButton = document.querySelector('#next-button') as HTMLButtonElement;
const runButton = document.querySelector('#run-button') as HTMLButtonElement;
const resetButton = document.querySelector('#reset-button') as HTMLButtonElement;
const deriveConstraintsCheckbox = document.querySelector('#derive-constraints-checkbox') as HTMLInputElement;

const ctx = outputCanvas.getContext('2d')!;

async function loadImage(url: URL): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = (_e) => resolve(image)
        image.src = url.toString();
    });
}

(async () => {
    const shouldDeriveConstraints = deriveConstraintsCheckbox.checked;
    const constraints = shouldDeriveConstraints ? deriveConstraints(sampleBoard, 20, 20) : pipeConstraints;
    const spriteSheet = new SpriteSheet(await loadImage(TILE_SPRITESHEET_URL));
    const wavy = new Wavy(outputCanvas, window, spriteSheet);

    nextButton.addEventListener('click', () => wavy.wavy(constraints, false));
    runButton.addEventListener('click', () => wavy.wavy(constraints, true));
    resetButton.addEventListener('click', () => wavy.resetBoard());
})();
