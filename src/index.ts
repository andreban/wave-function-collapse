import pipeConstraints from './pipe-constraints.json';
import sampleBoard from './sample.json';

const TILE_SIZE = 32;
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;
const TILE_IDS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11];
const TILE_SPRITESHEET_URL = new URL('pipe-tileset.png', import.meta.url);
const SPRITESHEET_INNER_PADDING = 2;
const SPRITESHEET_NUM_COLS = 6;
const ALPHA_OPAQUE = 1.0;

const outputCanvas = document.querySelector('#output-canvas') as HTMLCanvasElement;
const nextButton = document.querySelector('#next-button') as HTMLButtonElement;
const runButton = document.querySelector('#run-button') as HTMLButtonElement;
const resetButton = document.querySelector('#reset-button') as HTMLButtonElement;
const deriveConstraintsCheckbox = document.querySelector('#derive-constraints-checkbox') as HTMLInputElement;

const ctx = outputCanvas.getContext('2d')!;

type TileConstraints = {
    top: Array<number>, right: Array<number>, bottom: Array<number>, left: Array<number>
};

class Tile {
    x: number;
    y: number;
    selectedSprite?: number;
    options: Array<number>;

    constructor(x: number, y: number, options: Array<number>) {
        this.x = x;
        this.y = y;
        this.options = options;
        this.selectedSprite = undefined;
    }
}

function deriveConstraints(sampleBoard: [number]) {
    // Gets a value at position (x, y) on the board. If the position is out of bounds, then null is
    // returned.
    const valueAt = (x: number, y: number): number | null => {
        if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
            return null;
        }

        let position = y * BOARD_WIDTH + x;
        return sampleBoard[position];
    }

    let constraintsByType = new Map<number, TileConstraints>();
    for (let col = 0; col < BOARD_WIDTH; col++) {
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            let value = valueAt(col, row);
            if (value === null) {
                continue;
            }

            let constraints = constraintsByType.get(value);
            if (!constraints) {
                constraints = {top: [], right: [], bottom: [], left: []};
            }
            
            let top = valueAt(col, row - 1);
            if (top !== null) {
                constraints.top.push(top);
            }

            let right = valueAt(col + 1, row);
            if (right !== null) {
                constraints.right.push(right);
            }

            let bottom = valueAt(col, row + 1);
            if (bottom !== null) {
                constraints.bottom.push(bottom);
            }

            let left = valueAt(col - 1, row);
            if (left !== null) {
                constraints.left.push(left);
            }
            constraintsByType.set(value, constraints);
        }
    }

    return [...constraintsByType.entries()].map(([key, value]) => {
        return {
            id: key,
            constraints: value,
        }
    });
}

async function loadImage(url: URL): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = (_e) => resolve(image)
        image.src = url.toString();
    });
}

function renderBoard(tiles: Array<Tile>, spriteSheet: HTMLImageElement) {
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    // Render Tiles
    for (let tile of tiles) {
        let x = tile.x * TILE_SIZE;
        let y = tile.y * TILE_SIZE;
        for (let index of tile.options) {
            const srcY = Math.floor(index / SPRITESHEET_NUM_COLS) * (TILE_SIZE + SPRITESHEET_INNER_PADDING)
            const srcX = index % SPRITESHEET_NUM_COLS * (TILE_SIZE + SPRITESHEET_INNER_PADDING);
            ctx.globalAlpha = ALPHA_OPAQUE / tile.options.length;
            ctx.drawImage(spriteSheet, srcX, srcY, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
        }
    }
}

// This function randomly selects selects one of tile with the lowest entropy (i.e. the tile with
// the fewest options).
function selectLowestEntropyTile(tiles: Array<Tile>): Tile | null {
    let sorted = tiles
        .filter((t) => t.selectedSprite === undefined)
        .sort((a, b) => a.options.length - b.options.length);

    // Finished!
    if (sorted.length === 0) {
        return null;
    }
    let min = sorted[0].options.length;
    let filteredTiles = sorted.filter((tile) => tile.options.length === min);
    let lowestEntropyTile = filteredTiles[Math.floor(Math.random() * filteredTiles.length)];
    return lowestEntropyTile;
}

function printBoard(tiles: Array<Tile>) {
    let array = tiles.map((t) => t.selectedSprite);
    console.log(array.join(', '));
}

(async () => {
    let shouldDeriveConstraints = deriveConstraintsCheckbox.checked;
    let allConstraints = shouldDeriveConstraints ?
         deriveConstraints(sampleBoard as [number]) : pipeConstraints;
    let tiles: Array<Tile> = [];
    let imagePromise = await loadImage(TILE_SPRITESHEET_URL);

    // Initialize Tiles...
    function resetBoard() {
        tiles = [];
        for (let col = 0; col < BOARD_WIDTH; col++) {
            for (let row = 0; row < BOARD_HEIGHT; row++) {
                tiles.push(new Tile(row, col, [...TILE_IDS]));
            }
        }
        renderBoard(tiles, imagePromise);
    }

    resetBoard();

    // This selects the tile with the lowest entropy, randomly selects one of its options, and
    // updates the constraints of the surrounding tiles.
    let handleNextTile = (keepWalking: boolean) => {
        // Select the next tile.
        let nextTile = selectLowestEntropyTile(tiles);
        if (nextTile === null) {
            // printBoard(tiles);
            return;
        }

        // Randomly select one of the options for the next tile.
        let tileId = nextTile.options[Math.floor(Math.random() * nextTile.options.length)];
        nextTile.options = [tileId];
        nextTile.selectedSprite = tileId;
        
        // Get the constraints for the next tile.
        let constraints = allConstraints.find((c) => c.id === tileId)!.constraints;

        // Update the constraints for the tile above nextTile.
        let topTile = tiles.find((t) => t.x === nextTile!.x && t.y === nextTile!.y - 1);
        if (topTile && topTile.options.length > 1) {
            topTile.options = topTile.options.filter((o) => constraints.top.includes(o));
        }

        // Update the constraints for the tile to the right of nextTile.
        let rightTile = tiles.find((t) => t.x === nextTile!.x + 1 && t.y === nextTile!.y);
        if (rightTile && rightTile.options.length > 1) {
            rightTile.options = rightTile.options.filter((o) => constraints.right.includes(o));
        }

        // Update the constraints for the tile below nextTile.
        let bottomTile = tiles.find((t) => t.x === nextTile!.x && t.y === nextTile!.y + 1);
        if (bottomTile && bottomTile.options.length > 1) {
            bottomTile.options = bottomTile.options.filter((o) => constraints.bottom.includes(o));
        }

        // Update the constraints for the tile to the left of nextTile.
        let leftTile = tiles.find((t) => t.x === nextTile!.x - 1 && t.y === nextTile!.y);
        if (leftTile && leftTile.options.length > 1) {
            leftTile.options = leftTile.options.filter((o) => constraints.left.includes(o));
        }

        // Renders the board.
        renderBoard(tiles, imagePromise);

        // If keepWalking is true, then we keep walking. Otherwise, we stop.
        if (keepWalking) {
            requestAnimationFrame(() => handleNextTile(keepWalking));
        }
    }

    nextButton.addEventListener('click', () => handleNextTile(false));
    runButton.addEventListener('click', () => handleNextTile(true));
    resetButton.addEventListener('click', resetBoard);
})();
