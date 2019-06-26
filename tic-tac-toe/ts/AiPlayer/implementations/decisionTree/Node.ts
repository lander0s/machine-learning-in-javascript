import { TicTacToe } from '../../../TicTacToe'

export class Node {
    public board        : number[];
    public isWinnerNode : boolean;
    public weight       : number;
    public cellIndex    : number;
    public cellValue    : number;
    public parentNode   : Node;
    public children     : Node[];

    constructor() {
        this.board = [0,0,0,0,0,0,0,0,0];
        this.weight = 0;
        this.cellIndex = -1;
        this.cellValue = 0;
        this.parentNode = null;
        this.children = [];
    }

    public addChild(node:Node) : boolean {
        for(let i = 0 ; i < this.children.length; i++) {
            if(this.children[i].cellIndex == node.cellIndex) {
                return false;
            }
        }

        this.children.push(node);
        node.parentNode = this;
        for(let i = 0; i < node.board.length; i++) {
                 node.board[i] = this.board[i];
        }
        node.board[node.cellIndex] = node.cellValue;
        return true;
    }

    public getBoard() : number[] {
        return this.board;
    }

    public getHash() : string {
        return TicTacToe.getHash(this.board);
    }

    public getBestMoveFor(player:TicTacToe.Players) : number {
        let best = this.children[0];
        for(let i = 0; i < this.children.length; i++) {
            let node = this.children[i];
            if(player == TicTacToe.Players.X_Player) {
                if(best.weight < node.weight) {
                    best = node;
                }
                if(node.isWinnerNode) {
                    best = node;
                    break;
                }
            } else {
                if(best.weight > node.weight) {
                    best = node;
                }
                if(node.isWinnerNode) {
                    best = node;
                    break;
                }
            }
        }
        return best.cellIndex;
    }

    public propagateWin(player:TicTacToe.Players, value : number) : void {
        if(player == TicTacToe.Players.X_Player) {
            this.weight += value;
        } else {
            this.weight -= value;
        }
        if(this.parentNode != null) {
            this.parentNode.propagateWin(player, value);
        }
    }
}