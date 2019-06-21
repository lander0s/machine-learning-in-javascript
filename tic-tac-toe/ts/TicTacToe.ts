export class TicTacToe {
    private gameState      : TicTacToe.GameState;
    private table          : TicTacToe.Players[];
    private plays          : number[];
    private movementsCount : number;

    constructor() {
        this.gameState = TicTacToe.GameState.Empty;
        this.movementsCount = 0;
    }

    public getTableState(): number[] {
        return this.table;
    }

    public makePlay(x: number, y: number): void {
        if (this.gameState == TicTacToe.GameState.Draw
            || this.gameState == TicTacToe.GameState.X_Won
            || this.gameState == TicTacToe.GameState.O_Won) {
            return;
        }
        else if (this.gameState == TicTacToe.GameState.Empty) {
            this.gameState = TicTacToe.GameState.Playing;
        }

        let playIndex = y * 3 + x;
        let currentPlayer = this.getPlayersTurn();
        this.table[playIndex] = currentPlayer;
        this.movementsCount++;
        this.plays.push(playIndex);
    }

    public getPlayersTurn(): TicTacToe.Players {
        if (this.movementsCount % 2 == 0) {
            return TicTacToe.Players.X_Player;
        }
        else {
            return TicTacToe.Players.O_Player;
        }
    }

    public evaluateTable(): void {
        //lots of "if" go here
        let winningConditions = [
            [0,1,2],
            [3,4,5],
            [6,7,8],
            [0,3,6],
            [1,4,7],
            [2,5,8],
            [0,4,8],
            [2,4,6],
        ];

        winningConditions.forEach( (condition) => {
            if(this.table[condition[0]] != TicTacToe.Players.None &&
                this.table[condition[0]] == this.table[condition[1]] && 
                this.table[condition[0]] == this.table[condition[2]]) {
                if(this.table[condition[0]] == TicTacToe.Players.O_Player) {
                    this.gameState = TicTacToe.GameState.O_Won;
                } else {
                    this.gameState = TicTacToe.GameState.X_Won;
                }
            }
        });

        if(this.gameState != TicTacToe.GameState.Playing && this.gameState != TicTacToe.GameState.Empty) {
            let areThereEmptyCellsLeft = false;
            this.table.forEach((cell) => {
                if(cell == TicTacToe.Players.None) {
                    areThereEmptyCellsLeft = true;
                }
            });
            if(!areThereEmptyCellsLeft) {
                this.gameState = TicTacToe.GameState.Draw;
            }
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