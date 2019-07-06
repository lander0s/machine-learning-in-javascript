import { Vec2d } from "./Vec2d";

export class Bush {
    private position    : Vec2d;
    private fruitsCount : number;
    constructor(position:Vec2d) {
        this.position = position;
        this.fruitsCount = (Math.random() * 5) + 1;
    }

    public getPosition() : Vec2d {
        return this.position;
    }

    public update() : void {

    }

    public getFruitCount() : number {
        return this.fruitsCount;
    }
}