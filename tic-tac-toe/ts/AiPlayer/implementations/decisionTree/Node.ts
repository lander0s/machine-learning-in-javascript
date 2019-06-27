import { TicTacToe } from '../../../TicTacToe'

export class Node {
    public board    : TicTacToe.Players[];
    public weight   : number;
    public children : Node[];
    public parents  : Node[];
    public winner   : TicTacToe.Players;

    constructor(board: TicTacToe.Players[]) {
        this.board = [... board];
        this.weight = 0;
        this.parents = [];
        this.children = [];
        this.winner = TicTacToe.Players.None;
    }

    public addChild(node:Node) : boolean {
        for(let i = 0 ; i < this.children.length; i++) {
            if(this.children[i].getHash() == node.getHash()) {
                return false;
            }
        }
        this.children.push(node);
        return true;
    }

    public addParent(node:Node) : boolean {
        for(let i = 0 ; i < this.parents.length; i++) {
            if(this.parents[i].getHash() == node.getHash()) {
                return false;
            }
        }
        this.parents.push(node);
    }

    public getBoard() : TicTacToe.Players[] {
        return this.board;
    }

    public getHash() : string {
        return TicTacToe.getHash(this.board);
    }

    public getBestMoveFor(player:TicTacToe.Players) : Node {
        let best = this.children[0];
        for(let i = 0; i < this.children.length; i++) {
            let node = this.children[i];
            if(player == TicTacToe.Players.X_Player) {
                if(best.weight < node.weight) {
                    best = node;
                }
            } else {
                if(best.weight > node.weight) {
                    best = node;
                }
            }
        }
        return best;
    }

    public propagateWin(player:TicTacToe.Players, value : number = 1) : void {
        if(player == TicTacToe.Players.X_Player) {
            this.weight += value;
        } else {
            this.weight -= value;
        }
        this.parents.forEach((parentNode)=>{
            parentNode.propagateWin(player, value);
        });
    }
}