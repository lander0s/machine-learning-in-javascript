import { Simulator } from './Simulator'
import { Renderer } from './Renderer'
import { Test } from './Test'

export class Application {
    private mRenderer  : Renderer;
    private mSimulator: Simulator;
    private mTimestamp: number;

    public main() : void {
        this.mSimulator = new Simulator();
        this.mRenderer = new Renderer(this.mSimulator);
        this.mTimestamp = 0;
        window.addEventListener('click', e => this.spawnCreature());
    }

    public update() : void {
        let elapsedTime = new Date().getTime() - this.mTimestamp;
        if(elapsedTime > 16.666) {
            this.mSimulator.update();
            this.mTimestamp = new Date().getTime();
        }
        this.mRenderer.draw();
    }

    public spawnCreature() : void {
        this.mSimulator.addCreature();
    }

    public runTest() : void {
        let test = new Test();
        test.runTest();
    }
}