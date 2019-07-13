import { SimulatorConfig } from './Config'
import { Vec2d } from './Vec2d';
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
    private mBushesPosition : Vec2d[];

    public generate() : void {
        let perlinScale = 0.1 / (SimulatorConfig.terrainSizeInMts/128);
        noise.seed(Math.random());
        this.mTiles = [];
        this.mBushesPosition = [];
        const halfTerrainSize = SimulatorConfig.terrainSizeInMts/2;
        for(let x = 0; x < SimulatorConfig.terrainSizeInMts; x++) {
            this.mTiles[x] = [];
            for(let y = 0; y < SimulatorConfig.terrainSizeInMts; y++) {
                let worldPos = this.terrainCoordsToWorldPosition(x, y);
                let worldPosCopy = worldPos.copy();
                worldPosCopy.y *= 1.3; // so the island has an oval shape
                let distanceToCenter = worldPosCopy.length();
                let n = (noise.perlin2(x * perlinScale, y * perlinScale) + 1 ) / 2;
                let n2 = (noise.perlin2(x * x * perlinScale, y * y * perlinScale) + 1 ) / 2;
                n *= 1.0 - (distanceToCenter/(halfTerrainSize));       
                let material = this.getBiome(n);
                this.mTiles[x][y] = material;
                this.checkSpawnBush(n2, worldPos, material);
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

    public terrainCoordsToWorldPosition(x:number, y:number) : Vec2d {
        const halfTerrainSize = SimulatorConfig.terrainSizeInMts / 2;
        return new Vec2d (x - halfTerrainSize, y - halfTerrainSize);
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

    private checkSpawnBush(perlinNoiseValue: number, worldPosition: Vec2d, material: Biomes): void {
        if(material != Biomes.GRASSLAND && material != Biomes.FOREST) {
            return;
        }
        const bushRange = 0.05 / (SimulatorConfig.terrainSizeInMts/128);

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