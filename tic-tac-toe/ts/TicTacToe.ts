export class TicTacToe {
    private state      : TicTacToe.State;
    private board          : TicTacToe.Players[];
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
        this.state = TicTacToe.State.Empty;
        this.movementsCount = 0;
    }

    public getBoard(): number[] {
        return this.board;
    }

    public getState(): TicTacToe.State {
        return this.state;
    }

    public makePlay(x: number, y: number): void {
        if(this.state == TicTacToe.State.Draw
            || this.state == TicTacToe.State.X_Won
            || this.state == TicTacToe.State.O_Won) {
            return;
        }
        else if(this.state == TicTacToe.State.Empty) {
            this.state = TicTacToe.State.Playing;
        }

        let playIndex = y * 3 + x;
        let currentPlayer = this.getPlayersTurn();
        this.board[playIndex] = currentPlayer;
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
            if(this.board[condition[0]] != TicTacToe.Players.None &&
                this.board[condition[0]] == this.board[condition[1]] &&
                this.board[condition[0]] == this.board[condition[2]]) {
                if(this.board[condition[0]] == TicTacToe.Players.O_Player) {
                    this.state = TicTacToe.State.O_Won;
                } else {
                    this.state = TicTacToe.State.X_Won;
                }
                return;
            }
        }

        if(this.movementsCount == 9) {
            this.state = TicTacToe.State.Draw;
        }
    }
}

export namespace TicTacToe {
    export enum State {
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