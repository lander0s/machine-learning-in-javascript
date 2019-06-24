import { AiPlayer } from '../../AiPlayer'
import { TicTacToe } from '../../../TicTacToe';
import { DecisionTree } from './DecisionTree'
import { BoardBuilder  } from './BoardBuilder'

export class DecisionTreePlayer extends AiPlayer {
    private decisionTree : DecisionTree;
    private isTrained    : boolean;

    constructor() {
        super();
        this.decisionTree = new DecisionTree();
        this.isTrained = false;
    }

    public train() : void {
        this.decisionTree.build();
    }

    public play(board: TicTacToe.Players[], callback:Function) : void {
        if(!this.isTrained) {
            this.decisionTree.build();
            this.isTrained = true;
        }

        let bb = new BoardBuilder();
        bb.setBoard(board);
        let idx = this.decisionTree.getNodes()[bb.getHash()].getBestMoveFor(TicTacToe.Players.O_Player);
        let x = (idx % 3)|0;
        let y = (idx / 3)|0;
        callback(x, y);
    }
}