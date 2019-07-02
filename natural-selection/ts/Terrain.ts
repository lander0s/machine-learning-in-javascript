import { SimulatorConfig } from './Config'
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

export class Terrain {
    private mTiles : number[][];
    private mBushesPosition : number[][];

    public generate() : void {
        noise.seed(Math.random());
        this.mTiles = [];
        this.mBushesPosition = [];
        const halfTerrainSize = SimulatorConfig.terrainSizeInMts/2;
        for(let x = 0; x < SimulatorConfig.terrainSizeInMts; x++) {
            this.mTiles[x] = [];
            for(let y = 0; y < SimulatorConfig.terrainSizeInMts; y++) {
                let worldPos = this.terrainCoordsToWorldPosition(x, y);
                let worldPosCopy = [... worldPos];
                worldPosCopy[1] *= 1.3; // so the island has an oval shape
                let distanceToCenter = Math.sqrt(worldPosCopy[0] * worldPosCopy[0] + worldPosCopy[1] * worldPosCopy[1]);
                let n = (noise.perlin2(x/10, y/10) + 1 ) / 2;
                n *= 1.0 - (distanceToCenter/(halfTerrainSize));       
                let material = this.getBiome(n);
                this.mTiles[x][y] = material;
                this.checkSpawnBush(n, worldPos);
            }
        }
    }

    public forEachBush( callback : Function) {
        this.mBushesPosition.forEach((pos) => {
            callback(pos);
        });
    }

    public getTiles() : number[][] {
        return this.mTiles;
    }

    public terrainCoordsToWorldPosition(x:number, y:number) : number[] {
        const halfTerrainSize = SimulatorConfig.terrainSizeInMts / 2;
        return [x - halfTerrainSize, y - halfTerrainSize];
    }

    private getBiome(perlinNoiseOutput:number) : Biomes {
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

    private checkSpawnBush(perlinNoiseValue:number, worldPosition:number[]) : void {
        const bushRange = 0.01;

        let grasslandRange = SimulatorConfig.grasslandTreshold - SimulatorConfig.desertTreshold;
        let grasslandRangeCenter = grasslandRange / 2 + SimulatorConfig.desertTreshold;
        let bushRangeInGrassland = bushRange*grasslandRange;

        let forestRange = SimulatorConfig.forestTreshold - SimulatorConfig.grasslandTreshold;
        let forestRangeCenter = forestRange / 2 + SimulatorConfig.grasslandTreshold;
        let bushRangeInForest = bushRange*forestRange;

        if(Math.abs(perlinNoiseValue - grasslandRangeCenter) < bushRangeInGrassland
           || Math.abs(perlinNoiseValue - forestRangeCenter) < bushRangeInForest ) {
            this.mBushesPosition.push(worldPosition);
        }
    }

    public getClippingArea() : number[] {
        return [];
    }
}