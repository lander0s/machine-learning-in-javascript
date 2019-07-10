import { Vec2d } from "./Vec2d";
import { Object } from './Object'

export class Bush extends Object {
    private mFruitsCount : number;

    constructor(position:Vec2d) {
        super(position);
        this.mFruitsCount = (Math.random() * 5) + 1;
    }

    public update() : void {

    }

    public getFruitCount() : number {
        return this.mFruitsCount;
    }

    public consumeFruit() : boolean {
        if(this.mFruitsCount > 0 ) {
            this.mFruitsCount--;
            return true;
        }
        return false;
    }
}