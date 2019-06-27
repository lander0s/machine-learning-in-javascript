import { AiPlayer } from '../../AiPlayer'
import { TicTacToe } from '../../../TicTacToe'

export class RandomAiPlayer extends AiPlayer {

    constructor() {
        super();
    }

    public train() : void {
        /* nothing to do for random player */
    }

    public play(board: TicTacToe.Players[], turn : TicTacToe.Players, callback: Function) : void {
        let emptyCellsIndices = [];
        for(let i = 0; i < 9; i++) {
            if(board[i] == TicTacToe.Players.None) {
                emptyCellsIndices.push(i);
            }
        }
        let cellRange = 1.0 / emptyCellsIndices.length;
        let selectedIdx = (Math.random() / cellRange)|0;
        callback(emptyCellsIndices[selectedIdx]);
    }
}