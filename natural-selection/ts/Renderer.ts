import { Simulator } from './Simulator'
import { SimulatorConfig } from './Config';

export class Renderer {

    private mSimulator : Simulator;
    private mCanvas    : HTMLCanvasElement;
    private mContext   : CanvasRenderingContext2D;
    private mScale     : number;
    private mCameraPos : number[];
    
    constructor(simulator:Simulator) {
        this.mScale = 10.0;
        this.mCameraPos = [0, 0];
        this.mSimulator = simulator;
        this.mCanvas = document.querySelector('#main-canvas');
        this.onResize();
    }

    public onResize() : void {
        this.mCanvas.width = window.innerWidth;
        this.mCanvas.height = window.innerHeight;
        this.mContext = this.mCanvas.getContext('2d');
    }

    public draw() : void {
        this.mContext.clearRect(0, 0, this.mCanvas.width, this.mCanvas.height);
        this.mContext.save();
        this.mContext.translate(this.mCanvas.width/2, this.mCanvas.height/2);
        this.mContext.scale(1, -1);
        this.mContext.translate(-this.mCameraPos[0], -this.mCameraPos[1]);
        this.drawTerrain();
        this.mContext.restore();
    }

    public drawTerrain() : void {
        this.mContext.save();
        let terrain = this.mSimulator.getTerrain();
        let terrainSizeInPixels = SimulatorConfig.terrainSizeInMts * this.mScale;
        let halfTerrainSizeInPixels = terrainSizeInPixels / 2;
        this.mContext.strokeStyle = 'white';
        this.mContext.translate(-halfTerrainSizeInPixels,-halfTerrainSizeInPixels);
        for(let x = 0; x < SimulatorConfig.terrainSizeInMts; x++) {
            for(let y = 0; y < SimulatorConfig.terrainSizeInMts; y++) {
                let idx = y * SimulatorConfig.terrainSizeInMts + x;
                let val = terrain[x][y] * 255;
                this.mContext.fillStyle = `rgba(${val},${val},${val})`;
                let xPixels = (x * this.mScale) - (this.mScale/2);
                let yPixels = (y * this.mScale) - (this.mScale/2);
                this.mContext.fillRect(xPixels, yPixels, this.mScale, this.mScale);
            }
        }
        this.mContext.restore();
    }
}