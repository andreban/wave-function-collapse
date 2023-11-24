const SPRITESHEET_INNER_PADDING = 2;
const SPRITESHEET_NUM_COLS = 6;

export class SpriteSheet {
    private image: ImageBitmap;
    private numCols = SPRITESHEET_NUM_COLS;
    private innerPadding = SPRITESHEET_INNER_PADDING;

    constructor(image: ImageBitmap) {
        this.image = image;
    }

    public getImage(): ImageBitmap {
        return this.image;
    }

    public getNumCols() {
        return this. numCols;
    }

    public getInnerPadding() {
        return this.innerPadding;
    }
}
