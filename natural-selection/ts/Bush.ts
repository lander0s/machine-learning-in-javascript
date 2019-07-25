import { Vec2d } from "./Vec2d";
import { Object } from './Object'

export class Bush extends Object {
    private AVG_BUSH_FRUIT_CAPACITY: number = 5;
    private mBushSize: number;
    private mFruitSize: number;
    private mMaxFruits: number;
    private mFruitsCount: number;
    private mFruitsEnergyValue: number;
    private mEnergy: number;

    constructor(position: Vec2d) {
        super(position);
        //Values from 50% to 200% with an avg of 125%
        this.mBushSize = Math.random() * 1.5 + 0.5;
        this.mFruitSize = Math.random() * 1.5 + 0.5;
        this.mMaxFruits = ((this.mBushSize * this.AVG_BUSH_FRUIT_CAPACITY) / this.mFruitSize) | 0;
        this.mFruitsCount = (Math.random() * this.mMaxFruits + 1) | 0;
        this.mFruitsEnergyValue = (this.mFruitSize * 200) | 0;
        this.mEnergy = 0;
    }

    public update(): void {
        if(this.canProduce()) {
            this.mEnergy++;
            this.produceFruit();
        }
    }

    public canProduce(): boolean {
        //if is alive?
        return this.mFruitsCount < this.mMaxFruits;
    }

    public produceFruit(): void {
        if(this.mEnergy >= this.mFruitsEnergyValue) {
            this.mEnergy -= this.mFruitsEnergyValue;
            this.mFruitsCount++;
        }
    }

    public consumeFruit(): boolean {
        if(this.hasFruit()) {
            this.mFruitsCount--;
            return true;
        }
        return false;
    }

    public getBushSize(): number {
        return this.mBushSize;
    }

    public getFruitSize(): number {
        return this.mFruitSize;
    }

    public hasFruit(): boolean {
        return this.mFruitsCount > 0;
    }

    public getFruitCount(): number {
        return this.mFruitsCount;
    }

    public getFruitsEnergyValue(): number {
        return this.mFruitsEnergyValue;
    }
}