class GameContext {
    public state          : TicTacToe.State;
    public board          : TicTacToe.Players[];
    public plays          : number[];
    public movementsCount : number;
    public winnerCondIdx  : number;
    public copyFrom(gameContext : GameContext) : void {
        this.state = gameContext.state;
        this.board = [ ... gameContext.board];
        this.plays = [ ... gameContext.plays];
        this.movementsCount = gameContext.movementsCount;
        this.winnerCondIdx = gameContext.winnerCondIdx;
    }
}

export class TicTacToe {
    private ctx : GameContext;
    private ctxStack : GameContext[];

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
        this.ctxStack = [];
        this.restart();
    }

    public restart() : void {
        this.ctx = new GameContext();
        this.ctx.state = TicTacToe.State.Playing;
        this.ctx.movementsCount = 0;
        this.ctx.board = [];
        this.ctx.plays = [];
        this.ctx.winnerCondIdx = -1;
        for(let i = 0; i < 9; i++) {
            this.ctx.board.push(TicTacToe.Players.None);
        }
    }

    public getBoard(): number[] {
        return this.ctx.board;
    }

    public getHash(): string {
        return TicTacToe.getHash(this.ctx.board);
    }

    public static getHash(board:number[]) : string {
        let hash : string = '';
        for(let i = 0; i < 9; i++) {
            hash += board[i].toString();
        }
        return hash;
    }

    public getPlaysOrder(): number[] {
        return this.ctx.plays;
    }

    public getState(): TicTacToe.State {
        return this.ctx.state;
    }

    public isFinished(): boolean {
        return this.ctx.state != TicTacToe.State.Playing;
    }

    public makePlay(cellIndex : number): boolean {
        if(this.isFinished()) {
            return;
        }

        let currentPlayer = this.getPlayersTurn();
        if(this.ctx.board[cellIndex] != TicTacToe.Players.None) {
            return false;
        }
        
        this.ctx.board[cellIndex] = currentPlayer;
        this.ctx.movementsCount++;
        this.ctx.plays.push(cellIndex);
        this.evaluateBoard();
        return true;
    }

    public getPlayersTurn(): TicTacToe.Players {
        if(this.ctx.movementsCount % 2 == 0) {
            return TicTacToe.Players.X_Player;
        }
        else {
            return TicTacToe.Players.O_Player;
        }
    }

    public evaluateBoard(): void {
        if(this.ctx.movementsCount < 5) {
            return;
        }

        for(let i = 0; i < this.winningConditions.length; i++) {
            let condition = this.winningConditions[i];
            if(this.ctx.board[condition[0]] != TicTacToe.Players.None &&
                this.ctx.board[condition[0]] == this.ctx.board[condition[1]] &&
                this.ctx.board[condition[0]] == this.ctx.board[condition[2]]) {
                if(this.ctx.board[condition[0]] == TicTacToe.Players.O_Player) {
                    this.ctx.state = TicTacToe.State.O_Won;
                } else {
                    this.ctx.state = TicTacToe.State.X_Won;
                }
                this.ctx.winnerCondIdx = i;                
                return;
            }
        }

        if(this.ctx.movementsCount == 9) {
            this.ctx.state = TicTacToe.State.Draw;
        }
    }

    public getWinningConditionIndex(): number {
        return this.ctx.winnerCondIdx;
    }

    public save() : void {
        let newCtx = new GameContext();
        newCtx.copyFrom(this.ctx);
        this.ctxStack.push(this.ctx);
        this.ctx = newCtx;
    }

    public restore() : void {
        this.ctx = this.ctxStack.pop();
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