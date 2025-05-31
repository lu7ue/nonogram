const { app } = require('@azure/functions');

app.http('CheckWin', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('HTTP trigger function processed request for CheckWin');

        const { puzzle, state } = await request.json();

        if (!puzzle || !state || !Array.isArray(puzzle) || !Array.isArray(state)) {
            return {
                status: 400,
                body: { error: 'Invalid input: puzzle and state must be arrays' }
            };
        }

        if (puzzle.length !== state.length || (puzzle[0] && state[0] && puzzle[0].length !== state[0].length)) {
            return {
                status: 400,
                body: { error: 'Invalid input: puzzle and state dimensions do not match' }
            };
        }

        let isWin = true;
        for (let i = 0; i < puzzle.length; i++) {
            if (!Array.isArray(puzzle[i]) || !Array.isArray(state[i])) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: "Invalid input: puzzle and state rows must be arrays" }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                };
            }
            for (let j = 0; j < puzzle[i].length; j++) {
                const puzzleValue = puzzle[i][j] === 1 ? true : false;
                const stateValue = state[i][j] === null ? false : state[i][j];

                if (puzzleValue && stateValue !== true) {
                    isWin = false;
                    break;
                }
                if (!puzzleValue && stateValue === true) {
                    isWin = false;
                    break;
                }
            }
            if (!isWin) break;
        }

        return {
            status: 200,
            body: JSON.stringify({ isWin: isWin }),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
});