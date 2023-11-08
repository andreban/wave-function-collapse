import pipeConstraints from './pipe-constraints.json';

const TILE_SIZE = 32;
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;
const TILE_IDS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11];
const TILE_SPRITESHEET_URL = new URL('pipe-tileset.png', import.meta.url);
const SPRITESHEET_INNER_PADDING = 2;
const SPRITESHEET_NUM_COLS = 6;
const ALPHA_OPAQUE = 1.0;
const CANVAS_STYLE_BLACK = '#000000'

const outputCanvas = document.querySelector('#output-canvas') as HTMLCanvasElement;
const ctx = outputCanvas.getContext('2d')!;

class Tile {
    x: number;
    y: number;
    options: Array<number>;

    constructor(x: number, y: number, options: Array<number>) {
        this.x = x;
        this.y = y;
        this.options = options;
    }
}

async function loadImage(url: URL): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = (_e) => resolve(image)
        image.src = url.toString();
    });
}

// Initialize Tiles...
let tiles: Array<Tile> = [];
for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
        tiles.push(new Tile(row, col, [...TILE_IDS]));
    }
}

loadImage(TILE_SPRITESHEET_URL)
    .then((img) => {
        // Render Tiles
        for (let tile of tiles) {
            let x = tile.x * TILE_SIZE;
            let y = tile.y * TILE_SIZE;
            for (let index of tile.options) {
                const srcY = Math.floor(index / SPRITESHEET_NUM_COLS) * (TILE_SIZE + SPRITESHEET_INNER_PADDING)
                const srcX = index % SPRITESHEET_NUM_COLS * (TILE_SIZE + SPRITESHEET_INNER_PADDING);
                ctx.globalAlpha = ALPHA_OPAQUE / tile.options.length;
                ctx.drawImage(img, srcX, srcY, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
                ctx.globalAlpha = ALPHA_OPAQUE
                ctx.strokeStyle = CANVAS_STYLE_BLACK;
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            }
        }
    });
