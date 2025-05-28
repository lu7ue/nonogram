// 胜利检测函数：双重遍历每个格子
export async function checkWin(puzzle, state) {
    for (let i = 0; i < puzzle.length; i++) {
        for (let j = 0; j < puzzle[0].length; j++) {
            // 当 puzzle[i][j] 为 true 时，state[i][j] 必须为 true
            if (puzzle[i][j] && state[i][j] !== true) {
                return false;
            }
            // 当 puzzle[i][j] 为 false 时，state[i][j] 不能为 true（应该为false或null）
            if (!puzzle[i][j] && state[i][j] === true) {
                return false;
            }
        }
    }
    // 全部检查通过才返回true 否则返回false
    return true;
}