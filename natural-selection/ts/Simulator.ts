import { SimulatorConfig } from './Config'
declare var noise : any;

export class Simulator {
    private terrain : number[][];
    constructor() {
        this.generateTerrain();
    }

    public generateTerrain() {
        noise.seed(Math.random());
        this.terrain = [];
        for(let x = 0; x < SimulatorConfig.terrainSizeInMts; x++) {
            this.terrain[x] = [];
            for(let y = 0; y < SimulatorConfig.terrainSizeInMts; y++) {
                let dx = x - SimulatorConfig.terrainSizeInMts/2;
                let dy = y - SimulatorConfig.terrainSizeInMts/2;
                let distanceToCenter= Math.sqrt(dx*dx + dy*dy);
                let n = (noise.perlin2(x/10, y/10) + 1 ) / 2;
                n *= 1.0 - (distanceToCenter/(SimulatorConfig.terrainSizeInMts/2));       
                this.terrain[x][y] = n;
            }
        }
    }

    public getTerrain() : number[][] {
        return this.terrain;
    }

    public update() : void {

    }
}