import { SimulatorConfig } from './Config'
import { Creature } from './Creature';
import { Bush } from './Bush'
import { Terrain } from './Terrain'
import { Vec2d } from './Vec2d';

export class Simulator {
    private mTerrain   : Terrain;
    private mCreatures : Creature[];
    private mBushes    : Bush[];

    constructor() {
        this.mCreatures = [];
        this.mBushes = [];
        this.mTerrain = new Terrain();
        this.mTerrain.generate();
        this.mTerrain.forEachBush( (pos : Vec2d) => this.addBush(pos) );
    }

    public addBush(position:Vec2d) {
        this.mBushes.push(new Bush(position));
    }

    public getBushes() : Bush[] {
        return this.mBushes;
    }

    public getBushesInRadius(position:Vec2d, radius : number) : Bush[] {
        return this.mBushes.filter( bush => {
            return bush.getPosition().distance(position) <= radius;
        });
    }

    public getBushesInCircularSector(position:Vec2d, orientation : number, radius: number, angle : number) : Bush[] {
        let candidates = this.getBushesInRadius(position, radius);
        return candidates.filter( (bush) => {
            let toBushVec = bush.getPosition().subtract(position);
            let toBushAngle = toBushVec.direction();

            let normalizeDirA = toBushAngle;
            let normalizeDirB = Math.atan2(Math.sin(orientation), Math.cos(orientation));

            let diffDeg = (normalizeDirA - normalizeDirB) / Math.PI * 180.0;
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