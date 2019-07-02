import { Simulator } from './Simulator'
import { Biomes } from './Terrain'
import { SimulatorConfig } from './Config';

export class Renderer {

    private mSimulator         : Simulator;
    private mCanvas            : HTMLCanvasElement;
    private mContext           : CanvasRenderingContext2D;
    private mBackgroundCanvas  : HTMLCanvasElement;
    private mBackgroundContext : CanvasRenderingContext2D;
    private mScale             : number;
    private mCameraPos         : number[];
    private mNeedTerrainRender : boolean;
    private mVisibleArea       : number[]
    
    constructor(simulator:Simulator) {
        this.mScale = 10.0;
        this.mCameraPos = [0, 0];
        this.mSimulator = simulator;
        this.mCanvas = document.querySelector('#main-canvas');
        this.mBackgroundCanvas = document.querySelector('#background-canvas');
        this.mNeedTerrainRender = true;
        this.onResize();
        this.initializeMouseEventHandlers();
    }

    public initializeMouseEventHandlers() : void {
        window.addEventListener('wheel', (e)=>{
            let previousScale = this.mScale;
            let delta = e.deltaY / 100;
            this.mScale *= Math.pow(1.1, -delta);
            this.mScale = Math.max(Math.min(this.mScale, 100), 1);

            let cursorCartesianCoords = [(e.offsetX - window.innerWidth/2), -(e.offsetY - window.innerHeight/2)];
            let toOffsetInMts = (1 / previousScale - 1 / this.mScale);
            this.mCameraPos[0] += cursorCartesianCoords[0] * toOffsetInMts;
            this.mCameraPos[1] += cursorCartesianCoords[1] * toOffsetInMts;
            this.mNeedTerrainRender = true;
            this.updateVisibleArea();
        });
        window.addEventListener('mousemove', e => {
            const leftMouseButton = 1;
            if(e.buttons === leftMouseButton) {
                let offsetInMts = [e.movementX / this.mScale, -e.movementY / this.mScale];
                this.mCameraPos[0] -= offsetInMts[0];
                this.mCameraPos[1] -= offsetInMts[1];
                this.mNeedTerrainRender = true;
                this.updateVisibleArea();
            }
        });
    }

    public updateVisibleArea() : void {
        let halfScreenWidthInMts = (window.innerWidth / this.mScale)/2;
        let halfScreenHeightInMts = (window.innerWidth / this.mScale)/2;
        this.mVisibleArea = [];
        this.mVisibleArea[0] = this.mCameraPos[0] - (halfScreenWidthInMts + 2);
        this.mVisibleArea[1] = this.mCameraPos[1] - (halfScreenHeightInMts + 2);
        this.mVisibleArea[2] = this.mCameraPos[0] + (halfScreenWidthInMts + 2);
        this.mVisibleArea[3] = this.mCameraPos[1] + (halfScreenHeightInMts + 2);
    }

    public onResize() : void {
        this.mCanvas.width = window.innerWidth;
        this.mCanvas.height = window.innerHeight;
        this.mContext = this.mCanvas.getContext('2d');
        this.mBackgroundCanvas.width = window.innerWidth;
        this.mBackgroundCanvas.height = window.innerHeight;
        this.mBackgroundContext = this.mBackgroundCanvas.getContext('2d');
        this.updateVisibleArea();
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
        if(!this.mNeedTerrainRender) {
            return;
        }
        this.mBackgroundContext.save();
        this.mBackgroundContext.clearRect(0, 0, this.mBackgroundCanvas.width, this.mBackgroundCanvas.height);
        this.mBackgroundContext.translate(this.mBackgroundCanvas.width/2, this.mBackgroundCanvas.height/2);
        this.mBackgroundContext.scale(1, -1);
        this.mBackgroundContext.translate(-this.mCameraPos[0] * this.mScale, -this.mCameraPos[1] * this.mScale);
        let terrain = this.mSimulator.getTerrain().getTiles();
        let terrainSizeInPixels = SimulatorConfig.terrainSizeInMts * this.mScale;
        let halfTerrainSizeInPixels = terrainSizeInPixels / 2;
        this.mBackgroundContext.strokeStyle = 'white';
        this.mBackgroundContext.translate(-halfTerrainSizeInPixels,-halfTerrainSizeInPixels);

        let clip : number[] = [];
        this.mVisibleArea.forEach( val => {
            let cellVal = (val + SimulatorConfig.terrainSizeInMts/2)|0;
            cellVal = Math.max(Math.min(cellVal, SimulatorConfig.terrainSizeInMts-1), 1);
            clip.push(cellVal);
        });

        for(let x = clip[0]; x < clip[2]; x++) {
            for(let y = clip[1]; y < clip[3]; y++) {
                let idx = y * SimulatorConfig.terrainSizeInMts + x;
                let val = terrain[x][y] * 255;
                this.mBackgroundContext.fillStyle = this.getColorForMaterial(terrain[x][y]);
                let xPixels = (x * this.mScale) - (this.mScale/2);
                let yPixels = (y * this.mScale) - (this.mScale/2);
                this.mBackgroundContext.fillRect(xPixels, yPixels, this.mScale+1, this.mScale+1);
            }
        }
        this.mBackgroundContext.restore();
        this.mNeedTerrainRender = false;
    }

    public drawBushes() : void {
        if(this.mScale <= 5.0) {
            return;
        }
        this.mSimulator.getBushes().forEach( bush => {
            let pos = bush.getPosition();
            if(this.isInVisibleArea(pos)) {
                this.mContext.save();
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
            }
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

    public isInVisibleArea(pos:number[]) : boolean {
        return pos[0] >= this.mVisibleArea[0]
            && pos[0] <= this.mVisibleArea[2]
            && pos[1] >= this.mVisibleArea[1]
            && pos[1] <= this.mVisibleArea[3];
    }

    public drawCreatures() : void {
        this.mSimulator.getCreatures().forEach( creature => {
            let pos = creature.getPosition();
            if(this.isInVisibleArea(pos)) {
                this.mContext.save();
                let posInPixels = [pos[0] * this.mScale, pos[1] * this.mScale];
                this.mContext.translate(posInPixels[0], posInPixels[1]);
                let sizeInPixels = creature.getSize() * this.mScale;
                this.mContext.fillStyle = creature.isDead() ? 'black' : 'maroon';
                this.mContext.beginPath();
                this.mContext.arc(0, 0, sizeInPixels / 2, 0, 2 * Math.PI);
                this.mContext.fill();
                this.mContext.restore();
            }
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