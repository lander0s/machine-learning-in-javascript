import { Materials, Simulator } from './Simulator'
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
        window.addEventListener('wheel', (e)=>{
            let delta = e.deltaY * 0.015;
            this.mScale -= delta;
            if(this.mScale <= 1.0) {
                this.mScale = 1.0;
            }
        });
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
        this.drawCreatures();
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
                this.mContext.fillStyle = this.getColorForMaterial(terrain[x][y]);
                let xPixels = (x * this.mScale) - (this.mScale/2);
                let yPixels = (y * this.mScale) - (this.mScale/2);
                this.mContext.fillRect(xPixels, yPixels, this.mScale+1, this.mScale+1);
            }
        }
        this.mContext.restore();
    }

    public drawCreatures() : void {
        this.mSimulator.getCreatures().forEach( c => {
            this.mContext.save();
            let pos = c.getPosition();
            let posInPixels = [pos[0] * this.mScale, pos[1] * this.mScale];
            this.mContext.translate(posInPixels[0], posInPixels[1]);
            let sizeInPixels = c.getSize() * this.mScale;
            this.mContext.fillStyle = 'maroon';
            this.mContext.fillRect(sizeInPixels/2, sizeInPixels/2, sizeInPixels, sizeInPixels);
            this.mContext.restore();
        });
    }

    public getColorForMaterial(material:Materials) : string {
        if(material == Materials.DEEP_WATER)
            return '#2980b9';
        if(material == Materials.WATER)
            return '#3498db';
        if(material == Materials.SAND)
            return '#f39c12';
        if(material == Materials.GRASS)
            return '#1abc9c';
        if(material == Materials.DENSE_GRASS)
            return '#16a085';
        if(material == Materials.ROCK)
            return '#bdc3c7';
        if(material == Materials.SNOW)
            return '#ecf0f1';
    }
}