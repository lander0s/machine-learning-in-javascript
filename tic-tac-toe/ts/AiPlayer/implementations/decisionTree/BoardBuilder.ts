import { TicTacToe } from '../../../TicTacToe'

export class BoardBuilder {
    private board : TicTacToe.Players[];

    constructor() {
        this.board = [];
        for(let i = 0; i < 9; i++) {
            this.board.push(TicTacToe.Players.None);
        }
    }

    public setCellValue(index: number, value : TicTacToe.Players) : void {
        this.board[index] = value;
    }

    public getHash() :string {
        let hash : string = '';
        for(let i = 0; i < 9; i++) {
            hash += this.board[i].toString();
        }
        return hash;
    }

    public setBoard(board : TicTacToe.Players[]) : void {
        this.board = board;
    }

    public getBoard() : TicTacToe.Players[] {
        return this.board;
    }
}