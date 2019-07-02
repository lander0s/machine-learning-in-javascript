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

    public getTerrain() : Terrain {
        return this.mTerrain;
    }

    public update() : void {
        this.mCreatures.forEach( c => c.update());
    }

    public addCreature() : void {
        this.mCreatures.push(new Creature());
    }

    public getCreatures() : Creature[] {
        return this.mCreatures;
    }
}