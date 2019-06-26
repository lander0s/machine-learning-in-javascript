import { AiPlayer } from '../../AiPlayer'
import { TicTacToe } from '../../../TicTacToe';
import { DecisionTree } from './DecisionTree'

export class DecisionTreePlayer extends AiPlayer {
    private decisionTree : DecisionTree;

    constructor() {
        super();
        this.decisionTree = new DecisionTree();
    }

    public train() : void {
        this.decisionTree.build();
    }

    public play(board: TicTacToe.Players[], turn : TicTacToe.Players, callback:Function) : void {
        let idx = this.decisionTree.getNodes()[this.getBoardHash(board)].getBestMoveFor(turn);
        let x = (idx % 3)|0;
        let y = (idx / 3)|0;
        callback(x, y);
    }

    public getBoardHash(board: TicTacToe.Players[]) : string {
        let hash : string = '';
        for(let i = 0; i < 9; i++) {
            hash += board[i].toString();
        }
        return hash;
    }
}