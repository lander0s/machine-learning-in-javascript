import { Renderer } from './Renderer'
import { TicTacToe } from './TicTacToe'
import { AiPlayer } from './AiPlayer/AiPlayer'
import { RandomAiPlayer } from './AiPlayer/implementations/random/RandomAiPlayer'
import { DecisionTreePlayer } from './AiPlayer/implementations/decisionTree/DecisionTreePlayer';

export class Application {
    private renderer     : Renderer;
    private game         : TicTacToe;
    private aiPlayer     : AiPlayer;
    private cpuPlayer    : TicTacToe.Players;
    private humanPlayer  : TicTacToe.Players;

    public main() : void {
        this.cpuPlayer = TicTacToe.Players.X_Player;
        this.humanPlayer = TicTacToe.Players.O_Player;
        this.aiPlayer = null;
        this.game = new TicTacToe();
        this.renderer = new Renderer(this.game);
        this.renderer.onCellClicked((cellIndex:number)=> this.onCellClicked(cellIndex));
        this.renderer.draw();
        document.querySelector('#opponent-selector').addEventListener('change', (e) => this.onOpponentSelected(e));
        document.querySelector('#player-selector').addEventListener('change', (e) => this.onPlayerSelected(e));
        document.querySelector('#restart-button').addEventListener('click', ()=> this.restartGame() );
    }

    public onCellClicked(cellIndex:number) : void {
        if(this.aiPlayer != null) {
            if(!this.game.isFinished() && this.game.getPlayersTurn() == this.humanPlayer) {
                if(this.game.makePlay(cellIndex)) {
                    this.renderer.draw();
                    if(!this.game.isFinished()) {
                        let board = this.game.getBoard();
                        this.aiPlayer.play(board, this.cpuPlayer, (cellIndex:number) => {
                            this.game.makePlay(cellIndex);
                            this.renderer.draw();
                        });
                    }
                }
            }
        }
    }

    public restartGame() : void {
        this.game.restart();
        this.renderer.draw();
        if(this.cpuPlayer == TicTacToe.Players.X_Player && this.aiPlayer != null) {
            this.aiPlayer.play(this.game.getBoard(), TicTacToe.Players.X_Player, (cellIndex:number) => {
                this.game.makePlay(cellIndex);
                this.renderer.draw();
            });
        }
    }

    public onPlayerSelected(e : any) : void {
        if(e.srcElement.value == 'X') {
            this.humanPlayer = TicTacToe.Players.X_Player;
            this.cpuPlayer = TicTacToe.Players.O_Player;
        } else {
            this.humanPlayer = TicTacToe.Players.O_Player;
            this.cpuPlayer = TicTacToe.Players.X_Player;
        }
        this.restartGame();
    }

    public onOpponentSelected(e : any) : void {
        if(e.srcElement.value == 'random') {
            this.aiPlayer = new RandomAiPlayer();
        }
        else if(e.srcElement.value == 'tree') {
            this.aiPlayer = new DecisionTreePlayer();
        }
        
        this.showTrainingMessage();
        setTimeout(() => {
            this.aiPlayer.train();
            this.hideTrainingMessage();
            let board = this.game.getBoard();
            this.restartGame();
        },500);
    }

    public showTrainingMessage() : void {
        let message : any = document.querySelector('#training-message');
        message.style.zIndex =  1;
        message.style.opacity = 1;
    }

    public hideTrainingMessage() : void {
        let message : any = document.querySelector('#training-message');
        message.style.zIndex = -1;
        message.style.opacity = 0;
    }

    public save() : void {
       this.game.save();
    }

    public restore() : void {
        this.game.restore();
        this.renderer.draw();
    }
}