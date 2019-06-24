import { AiPlayer } from '../../AiPlayer'
import { TicTacToe } from '../../../TicTacToe';
import { DecisionTree } from './DecisionTree'
import { BoardBuilder  } from './BoardBuilder'

export class DecisionTreePlayer extends AiPlayer {
    private decisionTree : DecisionTree;

    constructor() {
        super();
        this.decisionTree = new DecisionTree();
    }

    public train() : void {
        this.decisionTree.build();
    }

    public play(board: TicTacToe.Players[], callback:Function) : void {
        let bb = new BoardBuilder();
        bb.setBoard(board);
        let idx = this.decisionTree.getNodes()[bb.getHash()].getBestMoveFor(TicTacToe.Players.O_Player);
        let x = (idx % 3)|0;
        let y = (idx / 3)|0;
        callback(x, y);
    }
}