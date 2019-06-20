export class TicTacToe {
    private gameState: number;
    private table: number[];
    private plays: number[];
    private movements: number;

    constructor() {
        this.gameState = TicTacToe.GameState.Empty;
        this.movements = 0;
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
        let currentPlayer = this.playersTurn();
        this.table[playIndex] = currentPlayer;
        this.movements++;
        this.plays.push(playIndex);
    }

    public playersTurn(): TicTacToe.Players {
        if (this.movements % 2 == 0) {
            return TicTacToe.Players.X_Player;
        }
        else {
            return TicTacToe.Players.O_Player;
        }
    }

    public evaluateTable(): void {
        //lots of "if" go here
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