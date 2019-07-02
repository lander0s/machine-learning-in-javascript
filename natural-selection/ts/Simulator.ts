import { SimulatorConfig } from './Config'
import { Creature } from './Creature';
import { Bush } from './Bush'

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
    private terrain   : number[][];
    private creatures : Creature[];
    private bushes    : Bush[];

    constructor() {
        this.creatures = [];
        this.bushes = [];
        this.generateTerrain();
    }

    public generateTerrain() {
        noise.seed(Math.random());
        this.terrain = [];
        const halfTerrainSize = SimulatorConfig.terrainSizeInMts/2;
        for(let x = 0; x < SimulatorConfig.terrainSizeInMts; x++) {
            this.terrain[x] = [];
            for(let y = 0; y < SimulatorConfig.terrainSizeInMts; y++) {
                let dx = x - halfTerrainSize;
                let dy = y - halfTerrainSize;
                dy *=  1.1;
                dx *=  0.8;
                let distanceToCenter= Math.sqrt(dx*dx + dy*dy);
                let n = (noise.perlin2(x/10, y/10) + 1 ) / 2;
                n *= 1.0 - (distanceToCenter/(halfTerrainSize));       
                let material = this.getMaterial(n);
                this.terrain[x][y] = material;
                this.checkSpawnBush(n, [x - halfTerrainSize, y - halfTerrainSize]);
            }
        }
    }

    public checkSpawnBush(terrainValue:number, position:number[]) {
        let grassRange = SimulatorConfig.grassTreshold - SimulatorConfig.sandTreshold;
        let grassCenter = (grassRange)/2 + SimulatorConfig.sandTreshold;
        let bushRange = 0.01;
        if(terrainValue > grassCenter - bushRange*grassRange && terrainValue < grassCenter + bushRange*grassRange) {
            this.bushes.push(new Bush(position));
        }

        let denseGrassRange = SimulatorConfig.denseGrassTreshold - SimulatorConfig.grassTreshold;
        let denseGrassCenter = (denseGrassRange)/2 + SimulatorConfig.grassTreshold;
        if(terrainValue > denseGrassCenter - bushRange*denseGrassRange && terrainValue < denseGrassCenter + bushRange*denseGrassRange) {
            this.bushes.push(new Bush(position));
        }
    }

    public getBushes() : Bush[] {
        return this.bushes;
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