import { TicTacToe } from '../TicTacToe'

export abstract class AiPlayer {
    public abstract train() : void;
    public abstract play(board: TicTacToe.Players[], callback : Function) : void;
}