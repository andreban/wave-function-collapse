import { TileConstraints } from "./constraints";
import { SpriteSheet } from "./spritesheet";

const TILE_SIZE = 32;
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;
const TILE_IDS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11];
const ALPHA_OPAQUE = 1.0;

export class Tile {
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

export class Wavy {
    private canvas: HTMLCanvasElement;
    private window: AnimationFrameProvider;
    private context: CanvasRenderingContext2D;
    private tiles: Array<Tile>;
    private spriteSheet: SpriteSheet;

    constructor(canvas: HTMLCanvasElement, window: AnimationFrameProvider, spritesheet: SpriteSheet) {
        this.canvas = canvas;
        this.window = window;
        this.context = canvas.getContext('2d')!;
        this.spriteSheet = spritesheet;
        this.resetBoard();
    }

    printBoard() {
        let array = this.tiles.map((t) => t.selectedSprite);
        console.log(array.join(', '));
    }

    public resetBoard() {
        this.tiles = [];
        for (let col = 0; col < BOARD_WIDTH; col++) {
            for (let row = 0; row < BOARD_HEIGHT; row++) {
                this.tiles.push(new Tile(row, col, [...TILE_IDS]));
            }
        }
        this.renderBoard();
    }

    private renderBoard() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Render Tiles
        for (let tile of this.tiles) {
            let x = tile.x * TILE_SIZE;
            let y = tile.y * TILE_SIZE;
            for (let index of tile.options) {
                const srcY = Math.floor(index / this.spriteSheet.getNumCols()) * (TILE_SIZE + this.spriteSheet.getInnerPadding())
                const srcX = index % this.spriteSheet.getNumCols() * (TILE_SIZE + this.spriteSheet.getInnerPadding());
                this.context.globalAlpha = ALPHA_OPAQUE / tile.options.length;
                this.context.drawImage(this.spriteSheet.getImage(), srcX, srcY, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // This function randomly selects selects one of tile with the lowest entropy (i.e. the tile with
    // the fewest options).
    private selectLowestEntropyTile(): Tile | null {
        let sorted = this.tiles
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

    // This selects the tile with the lowest entropy, randomly selects one of its options, and
    // updates the constraints of the surrounding tiles.
    public wavy(constraints: Array<TileConstraints>, keepWalking: boolean) {
        // Select the next tile.
        let nextTile = this.selectLowestEntropyTile();
        if (nextTile === null) {
            // printBoard(tiles);
            return;
        }

        // Randomly select one of the options for the next tile.
        let tileId = nextTile.options[Math.floor(Math.random() * nextTile.options.length)];
        nextTile.options = [tileId];
        nextTile.selectedSprite = tileId;
        
        // Get the constraints for the next tile.
        let tileConstraints = constraints.find((c) => c.id === tileId)!.constraints;

        // Update the constraints for the tile above nextTile.
        let topTile = this.tiles.find((t) => t.x === nextTile!.x && t.y === nextTile!.y - 1);
        if (topTile && topTile.options.length > 1) {
            topTile.options = topTile.options.filter((o) => tileConstraints.top.includes(o));
        }

        // Update the constraints for the tile to the right of nextTile.
        let rightTile = this.tiles.find((t) => t.x === nextTile!.x + 1 && t.y === nextTile!.y);
        if (rightTile && rightTile.options.length > 1) {
            rightTile.options = rightTile.options.filter((o) => tileConstraints.right.includes(o));
        }

        // Update the constraints for the tile below nextTile.
        let bottomTile = this.tiles.find((t) => t.x === nextTile!.x && t.y === nextTile!.y + 1);
        if (bottomTile && bottomTile.options.length > 1) {
            bottomTile.options = bottomTile.options.filter((o) => tileConstraints.bottom.includes(o));
        }

        // Update the constraints for the tile to the left of nextTile.
        let leftTile = this.tiles.find((t) => t.x === nextTile!.x - 1 && t.y === nextTile!.y);
        if (leftTile && leftTile.options.length > 1) {
            leftTile.options = leftTile.options.filter((o) => tileConstraints.left.includes(o));
        }

        // Renders the board.
        this.renderBoard();

        // If keepWalking is true, then we keep walking. Otherwise, we stop.
        if (keepWalking) {
            this.window.requestAnimationFrame(() => this.wavy(constraints, keepWalking));
        }        
    }
}
