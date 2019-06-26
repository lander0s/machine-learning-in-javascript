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
        let game = new TicTacToe();
        this.explore(game);
        console.log(this.hashTable['000000000']);
    }

    private explore(game: TicTacToe) : void {
        let board = game.getBoard();

        for(let i = 0; i < board.length; i++) {
            if(board[i] == TicTacToe.Players.None) {
                game.save();
                let newNode = new Node();
                newNode.cellIndex = i;
                newNode.cellValue = game.getPlayersTurn();
                let x = (i % 3)|0;
                let y = (i / 3)|0;

                if(this.hashTable[game.getHash()].addChild(newNode)) {
                    this.hashTable[newNode.getHash()] = newNode;
                }

                game.makePlay(x, y);
                if(game.isFinished()) {
                    if(game.getState() == TicTacToe.State.X_Won) {
                        newNode.propagateWin(TicTacToe.Players.X_Player, 1/i);
                        newNode.isWinnerNode = true;
                    }
                    else if(game.getState() == TicTacToe.State.O_Won) {
                        newNode.propagateWin(TicTacToe.Players.O_Player, 1/i);
                        newNode.isWinnerNode = true;
                    }
                }
                else {
                    this.explore(game);
                }
                game.restore();
            }
        }
    }

    private initializeRootNode() : void {
        this.hashTable = { };
        let rootNode = new Node();
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