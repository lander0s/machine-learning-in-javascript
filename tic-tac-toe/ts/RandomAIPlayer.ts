import { AIPlayer } from './AIPlayer'
import { TicTacToe } from './TicTacToe'

export class RandomAIPlayer extends AIPlayer {

    constructor() {
        super();
    }

    public train() : void {
        /* nothing to do for random player */
    }

    public play(board: TicTacToe.Players[], callback: Function) : void {
        let emptyCellsIndices = [];
        for(let i = 0; i < 9; i++) {
            if(board[i] == TicTacToe.Players.None) {
                emptyCellsIndices.push(i);
            }
        }
        let cellRange = 1.0 / emptyCellsIndices.length;
        let selectedIdx = (Math.random() / cellRange)|0;
        let y = (emptyCellsIndices[selectedIdx] / 3)|0;
        let x = (emptyCellsIndices[selectedIdx] % 3)|0;
        setTimeout(()=>{
            callback(x, y);
        }, 500);
    }
}