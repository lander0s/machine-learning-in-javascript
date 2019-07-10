import { Vec2d } from './Vec2d'

export class Object {
    protected mPosition : Vec2d;
    
    constructor(position:Vec2d) {
        this.mPosition = position;
    }

    public getPosition() : Vec2d {
        return this.mPosition;
    }
}