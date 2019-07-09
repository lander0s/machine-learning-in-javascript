import { Simulator } from './Simulator'
import { Renderer } from './Renderer'
import { Test } from './Test'
import { Vec2d } from './Vec2d';

export class Application {
    private mRenderer  : Renderer;
    private mSimulator: Simulator;
    private mTimestamp: number;

    public main() : void {
        this.mSimulator = new Simulator();
        this.mRenderer = new Renderer(this.mSimulator);
        this.mTimestamp = 0;
        window.addEventListener('click', (e) => {
            let screenSpaceCursorPos = new Vec2d(e.offsetX, e.offsetY);
            let worldPos = this.mRenderer.screenSpaceToWorld(screenSpaceCursorPos);
            this.spawnCreature(worldPos);
        });
        let loadingMessage : HTMLElement = document.querySelector('#loading-message');
        loadingMessage.style.opacity = '0';
    }

    public update() : void {
        let elapsedTime = new Date().getTime() - this.mTimestamp;
        if(elapsedTime > 16.666) {
            this.mSimulator.update();
            this.mTimestamp = new Date().getTime();
        }
        this.mRenderer.draw();
    }

    public spawnCreature(pos:Vec2d) : void {
        
        this.mSimulator.addCreature(pos);
    }

    public runTest() : void {
        let test = new Test();
        test.runTest();
    }
}