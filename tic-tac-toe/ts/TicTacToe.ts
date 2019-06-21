export class TicTacToe {
    private gameState      : TicTacToe.GameState;
    private table          : TicTacToe.Players[];
    private plays          : number[];
    private movementsCount : number;
    private winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    constructor() {
        this.gameState = TicTacToe.GameState.Empty;
        this.movementsCount = 0;
    }

    public getTableState(): number[] {
        return this.table;
    }

    public makePlay(x: number, y: number): void {
        if(this.gameState == TicTacToe.GameState.Draw
            || this.gameState == TicTacToe.GameState.X_Won
            || this.gameState == TicTacToe.GameState.O_Won) {
            return;
        }
        else if(this.gameState == TicTacToe.GameState.Empty) {
            this.gameState = TicTacToe.GameState.Playing;
        }

        let playIndex = y * 3 + x;
        let currentPlayer = this.getPlayersTurn();
        this.table[playIndex] = currentPlayer;
        this.movementsCount++;
        this.plays.push(playIndex);
        this.evaluateTable();
    }

    public getPlayersTurn(): TicTacToe.Players {
        if(this.movementsCount % 2 == 0) {
            return TicTacToe.Players.X_Player;
        }
        else {
            return TicTacToe.Players.O_Player;
        }
    }

    public evaluateTable(): void {
        if(this.movementsCount < 5) {
            return;
        }

        for(let i = 0; i < this.winningConditions.length; i++) {
            let condition = this.winningConditions[i];
            if(this.table[condition[0]] != TicTacToe.Players.None &&
                this.table[condition[0]] == this.table[condition[1]] &&
                this.table[condition[0]] == this.table[condition[2]]) {
                if(this.table[condition[0]] == TicTacToe.Players.O_Player) {
                    this.gameState = TicTacToe.GameState.O_Won;
                } else {
                    this.gameState = TicTacToe.GameState.X_Won;
                }
                return;
            }
        }

        if(this.movementsCount == 9) {
            this.gameState = TicTacToe.GameState.Draw;
        }
    }
}

export namespace TicTacToe {
    export enum GameState {
        Empty,
        Playing,
        Draw,
        X_Won,
        O_Won
    }

    export enum Players {
        None,
        X_Player,
        O_Player
    }
}