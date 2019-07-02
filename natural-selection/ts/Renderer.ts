import { Biomes, Simulator } from './Simulator'
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
        this.initializeMouseEventHandlers();
    }

    public initializeMouseEventHandlers() : void {
        window.addEventListener('wheel', (e)=>{
            let previousScale = this.mScale;
            let delta = e.deltaY / 100;
            this.mScale *= Math.pow(1.1, -delta);
            this.mScale = Math.max(Math.min(this.mScale, 1000), 1);

            let cursorCartesianCoords = [(e.offsetX - window.innerWidth/2), -(e.offsetY - window.innerHeight/2)];
            let toOffsetInMts = (1 / previousScale - 1 / this.mScale);
            this.mCameraPos[0] += cursorCartesianCoords[0] * toOffsetInMts;
            this.mCameraPos[1] += cursorCartesianCoords[1] * toOffsetInMts;
        });
        window.addEventListener('mousemove', e => {
            const leftMouseButton = 1;
            if(e.buttons === leftMouseButton) {
                let offsetInMts = [e.movementX / this.mScale, -e.movementY / this.mScale];
                this.mCameraPos[0] -= offsetInMts[0];
                this.mCameraPos[1] -= offsetInMts[1];
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
        this.mContext.translate(-this.mCameraPos[0] * this.mScale, -this.mCameraPos[1] * this.mScale);
        this.drawTerrain();
        this.drawBushes();
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

    public drawBushes() : void {
        if(this.mScale <= 5.0) {
            return;
        }
        this.mSimulator.getBushes().forEach( bush => {
            this.mContext.save();
            let pos = bush.getPosition();
            this.mContext.translate( pos[0] * this.mScale, pos[1] * this.mScale);
            this.mContext.translate( 0, -0.25 * this.mScale);
            this.mContext.beginPath();
            this.mContext.arc(0,0, 0.25 * this.mScale, 0, Math.PI);
            this.mContext.fillStyle = 'green';
            this.mContext.fill();
            this.mContext.translate( 0,  0.30 * this.mScale);
            this.mContext.beginPath();
            this.mContext.arc(0,0, 0.25 * this.mScale, 0, Math.PI*2);
            this.mContext.fillStyle = 'green';
            this.mContext.fill();
            this.drawFruits(bush.getFruitCount());
            this.mContext.restore();
        });
    }

    public drawFruits(count : number) : void {
        if(this.mScale <= 30) {
            return;
        }
        let angleBetweenFruits =  Math.PI / count;
        for(let i = 0; i < count; i++) {
            this.mContext.save();
            let angle = angleBetweenFruits * i;
            this.mContext.rotate(-angle);
            this.mContext.beginPath();
            this.mContext.arc(-0.15 * this.mScale, 0.0, 0.025 * this.mScale, 0, Math.PI * 2);
            this.mContext.fillStyle = 'red';
            this.mContext.fill();
            this.mContext.restore();
        }
    }

    public drawCreatures() : void {
        this.mSimulator.getCreatures().forEach( creature => {
            this.mContext.save();
            let pos = creature.getPosition();
            let posInPixels = [pos[0] * this.mScale, pos[1] * this.mScale];
            this.mContext.translate(posInPixels[0], posInPixels[1]);
            let sizeInPixels = creature.getSize() * this.mScale;
            if(creature.isDead()) {
                this.mContext.fillStyle = 'black';
            }
            else{
                this.mContext.fillStyle = 'maroon';
            }
            //this.mContext.fillRect(-sizeInPixels/2, -sizeInPixels/2, sizeInPixels, sizeInPixels);
            this.mContext.beginPath();
            this.mContext.arc(0, 0, sizeInPixels / 2, 0, 2 * Math.PI);
            this.mContext.fill();
            this.mContext.restore();
        });
    }

    public getColorForMaterial(material:Biomes) : string {
        if(material == Biomes.DEEP_WATER)
            return '#2980b9';
        if(material == Biomes.WATER)
            return '#3498db';
        if(material == Biomes.DESERT)
            return '#f39c12';
        if(material == Biomes.GRASSLAND)
            return '#1abc9c';
        if(material == Biomes.FOREST)
            return '#16a085';
        if(material == Biomes.MOUNTAIN)
            return '#bdc3c7';
        if(material == Biomes.SNOW)
            return '#ecf0f1';
    }
}