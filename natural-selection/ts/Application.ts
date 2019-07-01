import { Simulator } from './Simulator'
import { Renderer } from './Renderer'

export class Application {
    private mRenderer  : Renderer;
    private mSimulator : Simulator;
    private mTimestamp : number;

    public main() : void {
        this.mSimulator = new Simulator();
        this.mRenderer = new Renderer(this.mSimulator);
        this.mTimestamp = 0;
    }

    public update() : void {
        let elapsedTime = new Date().getTime() - this.mTimestamp;
        if(elapsedTime > 1000) {
            this.mSimulator.update();    
            this.mTimestamp = new Date().getTime();
        }

        this.mRenderer.draw();
    }

    public spawnCreature() : void {
        this.mSimulator.addCreature();
    }
}