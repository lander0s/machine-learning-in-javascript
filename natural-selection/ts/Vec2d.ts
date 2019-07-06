
export class Vec2d {
    
    public static Up    : Vec2d = new Vec2d(0, 1);
    public static Down  : Vec2d = new Vec2d(0, -1);
    public static Right : Vec2d = new Vec2d(1, 0);
    public static Left  : Vec2d = new Vec2d(-1, 0);

    public x : number = 0;
    public y : number = 0;
    
    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }
    
    public add(v : Vec2d) : Vec2d {        
        return new Vec2d(this.x + v.x, this.y + v.y);
    }
    
    
    public copy() : Vec2d {        
        return new Vec2d(this.x, this.y);
    }
    
    
    public distance(v : Vec2d) : number {
        return (v.subtract(this)).length();
    }
    
    public multiply(scalar : number) : Vec2d {
        return new Vec2d(this.x * scalar, this.y * scalar);
    }
    
    public length() :number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public lengthSQ() :number {
        return (this.x * this.x + this.y * this.y);
    }
    
    public normalize() : Vec2d {
        let len = this.length();

        return new Vec2d(this.x / len, this.y / len);
    }

    public subtract(v : Vec2d) : Vec2d {        
        return new Vec2d(this.x - v.x, this.y - v.y);
    }

    public toString() : string {
        return "(" + this.x + ", " + this.y + ")";
    }

    public getAngle(other : Vec2d) : number {
        return Math.acos(other.dot(this));
    }

    public dot(other : Vec2d) : number {
        return this.x * other.x + this.y * other.y;
    }
}
