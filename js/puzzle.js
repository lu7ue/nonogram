import { checkWin } from './check.js';

// 获取HTML中id为"app"的元素作为游戏容器
const app = document.getElementById('app');

let puzzles = [];
let state = [];

async function loadPuzzles() {
    try {
        const response = await fetch('../puzzles/puzzles.json');
        puzzles = await response.json();

        // 每次加载随机选一个谜题
        const randomIndex = Math.floor(Math.random() * puzzles.length);
        const puzzle = puzzles[randomIndex];
        createGrid(puzzle);
    } catch (error) {
        console.error('Failed to load puzzles:', error);
        app.innerHTML = '<p>无法加载拼图数据。</p>';
    }
}

// 创建及显示拼图
function createGrid(puzzle) {
    try {
        // 选择数组文件中的第一个拼图（暂时）
        // const puzzle = puzzles[0];
        // 验证确保：puzzle存在、是数组、且至少有一行数据
        if (!puzzle || !Array.isArray(puzzle) || !puzzle[0]) {
            throw new Error('Invalid puzzle data');
        }

        // 动态获取尺寸：获取行数 和 第一行的列数
        const rows = puzzle.length;
        const cols = puzzle[0].length;
        // 调试：确认尺寸正确
        console.log(`Grid dimensions: ${rows}x${cols}`);

        // 计算行提示和列提示：连续黑色格子的数量
        const rowHints = calculateRowHints(puzzle);
        const colHints = calculateColHints(puzzle);

        // 在根元素(:root)设置变量 之后在CSS中通过var(--rows)引用
        document.documentElement.style.setProperty('--rows', rows);
        document.documentElement.style.setProperty('--cols', cols);

        // 创建网格的外层容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'nonogram-container';
        app.innerHTML = '';
        app.appendChild(gridContainer);

        // 创建列提示区域
        const colHintsContainer = document.createElement('div');
        colHintsContainer.className = 'col-hints';
        gridContainer.appendChild(colHintsContainer);

        // 创建行提示和主网格容器
        const rowHintsAndGrid = document.createElement('div');
        rowHintsAndGrid.className = 'row-hints-and-grid';
        gridContainer.appendChild(rowHintsAndGrid);

        // 创建行提示区域
        const rowHintsContainer = document.createElement('div');
        rowHintsContainer.className = 'row-hints';
        rowHintsAndGrid.appendChild(rowHintsContainer);

        // 创建主网格
        const grid = document.createElement('div');
        grid.className = 'grid';
        rowHintsAndGrid.appendChild(grid);

        // 动态设置网格列数：gridTemplateColumns是CSS Grid布局的属性，用于定义网格的列数和每列的宽度。repeat() 是CSS Grid的辅助函数，用于快速重复相同的列/行定义
        // repeat(3, 40px) 等价于 40px 40px 40px
        grid.style.gridTemplateColumns = `repeat(${cols}, 80px)`;

        // 创建二维数组 跟踪每个格子的状态 --- null(初始)、true(填充)、false(标记X)
        state = Array(rows).fill().map(() => Array(cols).fill(null));

        // Create grid cells
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                // 存储格子的行列索引：以 data-* 形式访问DOM元素的属性 --- 通过 cell.dataset.row 或 cell.getAttribute('data-row') 读取值
                cell.dataset.row = i; // 等价于在HTML中设置 data-row="${i}"
                cell.dataset.col = j; // 等价于在HTML中设置 data-col="${j}"

                // 左键点击 设置为 true --- 如果当前状态是 true，则切换为 null。否则无论是 null 或 false，都切换为 true。
                cell.addEventListener('click', async () => {
                    state[i][j] = state[i][j] === true ? null : true; // state[0][0] 表示第1行第1列的格子；state[i][j] 表示第 i+1 行 第 j+1 列的格子
                    updateCellDisplay(cell, state[i][j]); // 每次点击后立即调用 updateCellDisplay 确保界面同步更新
                    if (await checkWin(puzzle, state)) showWinDialog(); // 检查胜利，注意这里变成了异步调用
                });

                // 右键点击（阻止默认菜单） 设置为 false --- 如果当前状态是 false，切换为 null。否则无论是 null 或 true，都切换为 false。
                cell.addEventListener('contextmenu', async (e) => {
                    e.preventDefault();
                    state[i][j] = state[i][j] === false ? null : false;
                    updateCellDisplay(cell, state[i][j]);
                    if (await checkWin(puzzle, state)) showWinDialog();
                });

                grid.appendChild(cell);
            }
        }

        // 渲染列提示
        colHints.forEach((hints) => {
            const hintElement = document.createElement('div');
            hintElement.className = 'col-hint';
            hintElement.textContent = hints.join('\n'); // 竖排显示数字
            colHintsContainer.appendChild(hintElement);
        });

        // 渲染行提示
        rowHints.forEach((hints) => {
            const hintElement = document.createElement('div');
            hintElement.className = 'row-hint';
            hintElement.textContent = hints.join(' '); // 横排显示数字
            rowHintsContainer.appendChild(hintElement);
        });

    } catch (error) {
        console.error('Error creating grid:', error);
        app.innerHTML = '<p>Error loading puzzle. Check console for details.</p>';
    }
}

// 根据格子的当前状态改外观
function updateCellDisplay(cell, state) {
    // 移除所有状态类 --- true 类 涂黑格子； false 类 显示 X；
    cell.classList.remove('true', 'false');

    // 根据状态添加对应的类 格子状态为 null 时 保持默认白色背景
    if (state === true) {
        cell.classList.add('true');
    } else if (state === false) {
        cell.classList.add('false');
    }
}

// 计算行提示
function calculateRowHints(puzzle) {
    return puzzle.map(row => {
        const hints = [];
        let count = 0;
        for (const cell of row) {
            if (cell) { // 如果是true（需要填充的格子）
                count++;
            } else if (count > 0) {
                hints.push(count);
                count = 0;
            }
        }
        if (count > 0) hints.push(count); // 处理最后一组
        return hints.length ? hints : [0]; // 如果全空返回[0]
    });
}

// 计算列提示
function calculateColHints(puzzle) {
    const colHints = [];
    for (let col = 0; col < puzzle[0].length; col++) {
        const hints = [];
        let count = 0;
        for (let row = 0; row < puzzle.length; row++) {
            if (puzzle[row][col]) { // 如果是true（需要填充的格子）
                count++;
            } else if (count > 0) {
                hints.push(count);
                count = 0;
            }
        }
        if (count > 0) hints.push(count);
        colHints.push(hints.length ? hints : [0]);
    }
    return colHints;
}

// 显示胜利弹窗
function showWinDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'win-dialog';

    dialog.innerHTML = `
        <h2>游戏结束</h2>
        <p>恭喜你，拼图已完成！</p>
        <button id="restart-button">再来一个</button>
    `;

    document.body.appendChild(dialog);

    document.getElementById('restart-button').addEventListener('click', () => {
        document.body.removeChild(dialog);

        // 随机选择一个新谜题
        const randomIndex = Math.floor(Math.random() * puzzles.length);
        const puzzle = puzzles[randomIndex];
        createGrid(puzzle);
    });
}

// 在页面完全加载后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing grid...');
    loadPuzzles();
});