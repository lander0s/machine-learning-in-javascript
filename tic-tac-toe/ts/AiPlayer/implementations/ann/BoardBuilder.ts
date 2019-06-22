

export class BoardBuilder {
    private board : number[];

    constructor() {
        for(let i = 0; i < 9; i++) {
            this.board[i] = 0;
        }
    }

    public setCellValue(index: number, value : number) : void {
        this.board[index] = value;
    }

    public getHash() {
        let hash : string = '';
        for(let i = 0; i < 9; i++) {
            hash += this.board[i].toString();
        }
        return hash;
    }

    public getBoard() : number[] {
        return this.board;
    }
}