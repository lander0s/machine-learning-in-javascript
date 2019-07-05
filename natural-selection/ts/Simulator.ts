import { SimulatorConfig } from './Config'
import { Creature } from './Creature';
import { Bush } from './Bush'
import { Terrain } from './Terrain'

export class Simulator {
    private mTerrain   : Terrain;
    private mCreatures : Creature[];
    private mBushes    : Bush[];

    constructor() {
        this.mCreatures = [];
        this.mBushes = [];
        this.mTerrain = new Terrain();
        this.mTerrain.generate();
        this.mTerrain.forEachBush( (pos : number[]) => this.addBush(pos) );
    }

    public addBush(position:number[]) {
        this.mBushes.push(new Bush(position));
    }

    public getBushes() : Bush[] {
        return this.mBushes;
    }

    public getBushesInRadius(x : number, y : number, radius : number) : Bush[] {
        return this.mBushes.filter( bush => {
            let bushPos = bush.getPosition();
            let diffX = bushPos[0] - x;
            let diffY = bushPos[1] - y;
            return Math.sqrt(diffX * diffX + diffY * diffY) <= radius;
        });
    }

    public getBushesInCircularSector(x: number, y: number, radius: number, orientation : number, angle : number) : Bush[] {
        let candidates = this.getBushesInRadius(x, y, radius);
        return candidates.filter( (candidate) => {
            let candidatePos = candidate.getPosition();
            let toBushVec = [ candidatePos[0] - x , candidatePos[1] - y];
            let toBushAngle = Math.atan(toBushVec[1] / toBushVec[0]);
            if(toBushVec[0] < 0 ) {
                toBushAngle += Math.PI;
            }
            let diffDeg = (toBushAngle - orientation) / Math.PI * 180.0;
            diffDeg = Math.abs((diffDeg + 180.0) % 360.0 - 180.0);
            let diffRad = diffDeg * Math.PI / 180.0;
            return diffRad <= (angle/2.0);
        });
    }

    public getTerrain() : Terrain {
        return this.mTerrain;
    }

    public update() : void {
        this.mCreatures.forEach( c => c.update());
    }

    public addCreature() : void {
        this.mCreatures.push(new Creature(this));
    }

    public getCreatures() : Creature[] {
        return this.mCreatures;
    }
}