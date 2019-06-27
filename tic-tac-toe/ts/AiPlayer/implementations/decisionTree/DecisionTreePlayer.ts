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
        let boardState = this.decisionTree.getNodes()[this.getBoardHash(board)].getBestMoveFor(turn).getBoard();
        let selectedIdx = 0;
        for(let i = 0 ; i < 9; i ++) {
            if(boardState[i] != board[i]) {
                selectedIdx = i;
                break;
            }
        }
        callback(selectedIdx);
    }

    public getBoardHash(board: TicTacToe.Players[]) : string {
        let hash : string = '';
        for(let i = 0; i < 9; i++) {
            hash += board[i].toString();
        }
        return hash;
    }
}