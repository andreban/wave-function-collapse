export type TileConstraints = {
    id: number,
    constraints: Constraints,
};

export type Constraints = {
    top: Array<number>, right: Array<number>, bottom: Array<number>, left: Array<number>
};

export function deriveConstraints(sampleBoard: Array<number>, sampleBoardWidth: number, sampleBoardHeight: number): Array<TileConstraints> {
    // Gets a value at position (x, y) on the board. If the position is out of bounds, then null is
    // returned.
    const valueAt = (x: number, y: number): number | null => {
        if (x < 0 || x >= sampleBoardWidth || y < 0 || y >= sampleBoardHeight) {
            return null;
        }

        let position = y * sampleBoardWidth + x;
        return sampleBoard[position];
    }

    let constraintsByType = new Map<number, Constraints>();
    for (let col = 0; col < sampleBoardWidth; col++) {
        for (let row = 0; row < sampleBoardHeight; row++) {
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
