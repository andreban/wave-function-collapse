const SPRITESHEET_INNER_PADDING = 2;
const SPRITESHEET_NUM_COLS = 6;

export class SpriteSheet {
    private image: HTMLImageElement;
    private numCols = SPRITESHEET_NUM_COLS;
    private innerPadding = SPRITESHEET_INNER_PADDING;

    constructor(image: HTMLImageElement) {
        this.image = image;
    }

    public getImage(): HTMLImageElement {
        return this.image;
    }

    public getNumCols() {
        return this. numCols;
    }

    public getInnerPadding() {
        return this.innerPadding;
    }
}
