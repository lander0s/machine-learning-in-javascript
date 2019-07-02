import { SimulatorConfig } from './Config'
import { Creature } from './Creature';
import { Bush } from './Bush'

declare var noise : any;

export const enum Biomes {
    WATER,
    DEEP_WATER,
    DESERT,
    GRASSLAND,
    FOREST,
    MOUNTAIN,
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
                let material = this.getBiome(n);
                this.terrain[x][y] = material;
                this.checkSpawnBush(n, [x - halfTerrainSize, y - halfTerrainSize]);
            }
        }
    }

    public checkSpawnBush(perlinNoiseOutput:number, position:number[]) {
        const bushRange = 0.01;

        let grasslandRange = SimulatorConfig.grasslandTreshold - SimulatorConfig.desertTreshold;
        let grasslandRangeCenter = grasslandRange / 2 + SimulatorConfig.desertTreshold;
        let bushRangeInGrassland = bushRange*grasslandRange;

        let forestRange = SimulatorConfig.forestTreshold - SimulatorConfig.grasslandTreshold;
        let forestRangeCenter = forestRange / 2 + SimulatorConfig.grasslandTreshold;
        let bushRangeInForest = bushRange*forestRange;

        if(Math.abs(perlinNoiseOutput - grasslandRangeCenter) < bushRangeInGrassland
           || Math.abs(perlinNoiseOutput - forestRangeCenter) < bushRangeInForest ) {
            this.bushes.push(new Bush(position));
        }
    }

    public getBushes() : Bush[] {
        return this.bushes;
    }

    public getBiome(perlinNoiseOutput:number) : Biomes {
        if(perlinNoiseOutput < SimulatorConfig.deepWaterTreshold) {
            return Biomes.DEEP_WATER;
        }
        if(perlinNoiseOutput < SimulatorConfig.waterTreshold) {
            return Biomes.WATER;
        }
        if(perlinNoiseOutput < SimulatorConfig.desertTreshold) {
            return Biomes.DESERT;
        }
        if(perlinNoiseOutput < SimulatorConfig.grasslandTreshold) {
            return Biomes.GRASSLAND;
        }
        if(perlinNoiseOutput < SimulatorConfig.forestTreshold) {
            return Biomes.FOREST;
        }
        if(perlinNoiseOutput < SimulatorConfig.mountainTreshold) {
            return Biomes.MOUNTAIN;
        }
        return Biomes.SNOW;
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