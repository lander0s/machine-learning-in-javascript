import { BoardBuilder } from './BoardBuilder'
import { TicTacToe } from '../../../TicTacToe'

export class Node {
    public weight       : number;
    public cellIndex    : number;
    public cellValue    : number;
    public parentNode   : Node;
    public children     : Node[];

    constructor() {
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
        return true;
    }

    public getBoard( bb : BoardBuilder) : void {
        if(this.parentNode != null) {
            this.parentNode.getBoard(bb);
        }
        if(this.cellIndex >= 0) {
            bb.setCellValue(this.cellIndex, this.cellValue);
        }
    }

    public getBoardHash() : string {
        let bb = new BoardBuilder();
        this.getBoard(bb);
        return bb.getHash();
    }

    public getBestMoveFor(player:TicTacToe.Players) : number {
        let best = this.children[0];
        this.children.forEach((node:Node)=> {
            if(player == TicTacToe.Players.X_Player) {
                if(best.weight < node.weight) {
                    best = node;
                }
            } else {
                if(best.weight > node.weight) {
                    best = node;
                }
            }
        });
        return best.cellIndex;
    }

    public propagateWin(player:TicTacToe.Players) : void {
        if(player == TicTacToe.Players.X_Player) {
            this.weight++;
        } else {
            this.weight--;
        }
        if(this.parentNode != null) {
            this.parentNode.propagateWin(player);
        }
    }
}