export class TicTacToe {
    private state          : TicTacToe.State;
    private board          : TicTacToe.Players[];
    private plays          : number[];
    private movementsCount : number;
    private winnerCondIdx  : number;
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
        this.state = TicTacToe.State.Playing;
        this.movementsCount = 0;
        this.board = [];
        this.plays = [];
        this.winnerCondIdx = -1;
        for(let i = 0; i < 9; i++) {
            this.board.push(TicTacToe.Players.None);
        }
    }

    public getBoard(): number[] {
        return this.board;
    }

    public getPlaysOrder(): number[] {
        return this.plays;
    }

    public getState(): TicTacToe.State {
        return this.state;
    }

    public isFinished(): boolean {
        return this.state != TicTacToe.State.Playing;
    }

    public makePlay(x: number, y: number): boolean {
        if(this.isFinished()) {
            return;
        }

        let playIndex = y * 3 + x;
        let currentPlayer = this.getPlayersTurn();
        if(this.board[playIndex] != TicTacToe.Players.None) {
            return false;
        }
        this.board[playIndex] = currentPlayer;
        this.movementsCount++;
        this.plays.push(playIndex);
        this.evaluateTable();
        return true;
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
                this.winnerCondIdx = i;                
                return;
            }
        }

        if(this.movementsCount == 9) {
            this.state = TicTacToe.State.Draw;
        }
    }

    public getWinningConditionIndex(): number {
        return this.winnerCondIdx;
    }
}

export namespace TicTacToe {
    export enum State {
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