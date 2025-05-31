export async function checkWin(puzzle, state) {
    try {
        const response = await fetch('https://nonogramfunction.azurewebsites.net/api/CheckWin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ puzzle, state }),
        });

        if (!response.ok) {
            throw new Error('Failed to check win condition');
        }

        const result = await response.json();
        return result.isWin;
    } catch (error) {
        console.error('Error checking win condition:', error);
        return false; // 如果调用失败，默认返回 false
    }
}