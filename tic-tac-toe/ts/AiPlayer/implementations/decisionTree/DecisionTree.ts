import { Node } from './Node'
import { TicTacToe } from '../../../TicTacToe';
import { BoardBuilder } from './BoardBuilder';

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

                let newNode = new Node();
                newNode.cellIndex = crtPermutation[j];
                newNode.cellValue = game.getPlayersTurn();
                let bb = new BoardBuilder();
                bb.setBoard(game.getBoard());
                if(this.hashTable[bb.getHash()].addChild(newNode)) {
                    this.hashTable[newNode.getBoardHash()] = newNode;   
                }
                let x = (crtPermutation[j] % 3)|0;
                let y = (crtPermutation[j] / 3)|0;
                game.makePlay(x, y);

                if(game.isFinished()) {
                    if(game.getState() == TicTacToe.State.X_Won) {
                        newNode.propagateWin(TicTacToe.Players.X_Player, 1/ i);
                    }
                    else if(game.getState() == TicTacToe.State.O_Won) {
                        newNode.propagateWin(TicTacToe.Players.O_Player, 1/ i);
                    }
                    break;
                }
            }
        }
        console.log(this.hashTable['000000000']);
    }

    private initializeRootNode() : void {
        this.hashTable = { };
        let rootNode = new Node();
        this.hashTable[rootNode.getBoardHash()] = rootNode;
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