import { Node } from './Node'
import { TicTacToe } from '../../../TicTacToe';

export class DecisionTree {

    private hashTable : { [key: string] : Node };
    private permutations : number[][];

    constructor() {
        this.hashTable = { };
        this.permutations = [];
    }

    public getNodes() : { [key: string] : Node } {
        return this.hashTable;
    }

    public build() : void {
        this.initializeRootNode();
        this.permutations = this.generatePermutations([0,1,2,3,4,5,6,7,8]);
        for(let i = this.permutations.length -1 ; i >= 0; i--) {
            let crtPermutation = this.permutations[i];
            let game = new TicTacToe();
            for(let j = 0; j < crtPermutation.length; j++) {

                let boardHashBeforeMove = game.getHash();
                game.makePlay(crtPermutation[j]);
                let boardHashAfterMove = game.getHash();

                if(this.hashTable[boardHashAfterMove] == undefined) {
                    this.hashTable[boardHashAfterMove] = new Node(game.getBoard());
                }

                this.hashTable[boardHashBeforeMove].addChild(this.hashTable[boardHashAfterMove]);
                this.hashTable[boardHashAfterMove].addParent(this.hashTable[boardHashBeforeMove]);

                if(game.isFinished()) {
                    if(game.getState() == TicTacToe.State.X_Won) {
                        this.hashTable[boardHashAfterMove].winner = TicTacToe.Players.X_Player;
                    }
                    else if(game.getState() == TicTacToe.State.O_Won) {
                        this.hashTable[boardHashAfterMove].winner = TicTacToe.Players.O_Player;
                    }
                    break;
                }
            }
        }

        for(let hash in this.hashTable) {
            let node = this.hashTable[hash];
            if(node.winner != TicTacToe.Players.None) {
                let steps = 0;
                for(let i = 0; i < 9; i ++) {
                    if(node.board[i] != TicTacToe.Players.None) {
                        steps++;
                    }
                }
                node.propagateWin(node.winner, 1 );
            }
        }
        console.log(this.hashTable['000000000']);
    }

    private initializeRootNode() : void {
        this.hashTable = { };
        let rootNode = new Node([0,0,0,0,0,0,0,0,0]);
        this.hashTable[rootNode.getHash()] = rootNode;
    }

    private generatePermutations(collection : number[]) : Array<Array<number>> {
        let ret :Array<Array<number>> = [];
        for (let i = 0; i < collection.length; i = i + 1) {
            let rest = this.generatePermutations(collection.slice(0, i).concat(collection.slice(i + 1)));
            if(!rest.length) {
                ret.push([collection[i]])
            } else {
                for(let j = 0; j < rest.length; j = j + 1) {
                    ret.push([collection[i]].concat(rest[j]))
                }
            }
        }
        return ret;
    }
}