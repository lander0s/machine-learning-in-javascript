import { SimulatorConfig } from './Config'
import { Creature } from './Creature';
import { Bush } from './Bush'
import { Terrain } from './Terrain'
import { Vec2d } from './Vec2d';

export class Simulator {
    private mTerrain    : Terrain;
    private mCreatures  : Creature[];
    private mBushes     : Bush[];

    constructor() {
        this.mCreatures = [];
        this.mBushes = [];
        this.mTerrain = new Terrain();
        this.mTerrain.generate();
        this.mTerrain.forEachBush((pos : Vec2d) => this.addBush(pos));
    }

    public addBush(position : Vec2d) {
        this.mBushes.push(new Bush(position));
    }

    public getBushes() : Bush[] {
        return this.mBushes;
    }

    public getVisibleCreaturesForCreature(creature : Creature) : Creature[] {
        return this.mCreatures.filter(creature => {
            let distance = creature.getPosition().distance(creature.getPosition());
            if(distance > creature.getFOVDistance()) {
                return false;
            }
            if(distance <= creature.getSize() / 2) {
                return true;
            }
            let toCreatureVec = creature.getPosition().subtract(creature.getPosition());
            let toCreatureAngle = toCreatureVec.direction();

            let normalizeDirA = toCreatureAngle;
            let normalizeDirB = Math.atan2(Math.sin(creature.getOrientation()), Math.cos(creature.getOrientation()));

            let diffDeg = (normalizeDirA - normalizeDirB) / Math.PI * 180.0;
            diffDeg = Math.abs((diffDeg + 180.0) % 360.0 - 180.0);
            let diffRad = diffDeg * Math.PI / 180.0;
            return diffRad <= (creature.getFOVAngle() / 2.0);
        });
    }

    public getVisibleBushesForCreature(creature : Creature) : Bush[] {
        return this.mBushes.filter(bush => {
            let distance = creature.getPosition().distance(bush.getPosition());
            if(distance > creature.getFOVDistance()) {
                return false;
            }
            if(distance <= creature.getSize() / 2) {
                return true;
            }
            let toBushVec = bush.getPosition().subtract(creature.getPosition());
            let toBushAngle = toBushVec.direction();

            let normalizeDirA = toBushAngle;
            let normalizeDirB = Math.atan2(Math.sin(creature.getOrientation()), Math.cos(creature.getOrientation()));

            let diffDeg = (normalizeDirA - normalizeDirB) / Math.PI * 180.0;
            diffDeg = Math.abs((diffDeg + 180.0) % 360.0 - 180.0);
            let diffRad = diffDeg * Math.PI / 180.0;
            return diffRad <= (creature.getFOVAngle() / 2.0);
        });
    }

    public getTerrain() : Terrain {
        return this.mTerrain;
    }

    public update() : void {
        this.mCreatures.forEach(c => c.update());
        this.mBushes.forEach(c => c.update());
    }

    public addCreature(pos : Vec2d) : void {
        this.mCreatures.push(new Creature(this, pos));
    }

    public getCreatures() : Creature[] {
        return this.mCreatures;
    }
}