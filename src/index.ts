import pipeConstraints from './pipe-constraints.json';

const TILE_SIZE = 32;
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;
const TILE_IDS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11];
const TILE_SPRITESHEET_URL = new URL('pipe-tileset.png', import.meta.url);

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

let image = loadImage(TILE_SPRITESHEET_URL)
    .then((img) => {
        // Render Tiles
        for (let tile of tiles) {
            let x = tile.x * TILE_SIZE;
            let y = tile.y * TILE_SIZE;
            for (let index of tile.options) {
                let row = index / 6
                let col = index  % 6;
                ctx.drawImage(img, 0, 0, 32, 32, 0, 0, 32, 32);
                ctx.strokeStyle = '#0';
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            }
        }
    });
