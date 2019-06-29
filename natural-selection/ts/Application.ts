import { Simulator } from './Simulator'
import { Renderer } from './Renderer'

export class Application {
    private mRenderer  : Renderer;
    private mSimulator : Simulator;

    public main() : void {
        this.mSimulator = new Simulator();
        this.mRenderer = new Renderer(this.mSimulator);
    }

    public update() : void {
        this.mSimulator.update();
        this.mRenderer.draw();
    }
}