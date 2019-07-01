import { SimulatorConfig } from './Config'
import { Creature } from './Creature';
declare var noise : any;

export const enum Materials {
    WATER,
    DEEP_WATER,
    SAND,
    GRASS,
    DENSE_GRASS,
    ROCK,
    SNOW
}

export class Simulator {
    private terrain : number[][];
    private creatures : Creature[];

    constructor() {
        this.generateTerrain();
        this.creatures = [];
    }

    public generateTerrain() {
        noise.seed(Math.random());
        this.terrain = [];
        for(let x = 0; x < SimulatorConfig.terrainSizeInMts; x++) {
            this.terrain[x] = [];
            for(let y = 0; y < SimulatorConfig.terrainSizeInMts; y++) {
                let dx = x - SimulatorConfig.terrainSizeInMts/2;
                let dy = y - SimulatorConfig.terrainSizeInMts/2;
                dy *=  1.1;
                dx *=  0.8;
                let distanceToCenter= Math.sqrt(dx*dx + dy*dy);
                let n = (noise.perlin2(x/10, y/10) + 1 ) / 2;
                n *= 1.0 - (distanceToCenter/(SimulatorConfig.terrainSizeInMts/2));       
                this.terrain[x][y] = this.getMaterial(n);
            }
        }
    }

    public getMaterial(f:number) : Materials {
        if(f < SimulatorConfig.deepWaterTreshold) {
            return Materials.DEEP_WATER;
        }
        if(f < SimulatorConfig.waterTreshold) {
            return Materials.WATER;
        }
        if(f < SimulatorConfig.sandTreshold) {
            return Materials.SAND;
        }
        if(f < SimulatorConfig.grassTreshold) {
            return Materials.GRASS;
        }
        if(f < SimulatorConfig.denseGrassTreshold) {
            return Materials.DENSE_GRASS;
        }
        if(f < SimulatorConfig.rockTreshold) {
            return Materials.ROCK;
        }
        return Materials.SNOW;
    }

    public getTerrain() : number[][] {
        return this.terrain;
    }

    public update() : void {
        this.creatures.forEach( c => c.update());
    }

    public addCreature() : void {
        this.creatures.push(new Creature());
    }

    public getCreatures() : Creature[] {
        return this.creatures;
    }
}