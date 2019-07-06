
export class Vec2d {
    
    public static Up    : Vec2d = new Vec2d(0, 1);
    public static Down  : Vec2d = new Vec2d(0, -1);
    public static Right : Vec2d = new Vec2d(1, 0);
    public static Left  : Vec2d = new Vec2d(-1, 0);
    public static Zero  : Vec2d = new Vec2d(0, 0);

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
    
    public scale(scalar : number) : Vec2d {
        return new Vec2d(this.x * scalar, this.y * scalar);
    }
    
    public length() : number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public lengthSQ() : number {
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

    public direction() : number {
        let rad = Math.atan(this.y / this.x);
        if(this.x < 0) {
            rad += Math.PI;
        }
        return rad;
    }

    public dot(other : Vec2d) : number {
        return this.x * other.x + this.y * other.y;
    }

    public getAngle(other : Vec2d) : number {
        let myDir = this.direction();
        let itsDir = other.direction();
        let diff = itsDir - myDir;
        if(diff < 0) {
            diff += Math.PI * 2;
        }
        return diff;
    }

    public clampLength(maxLength: number) : Vec2d {
        let len = this.length();
        if(len <= maxLength) {
            return this.copy();
        }

        let factor = maxLength / len;
        return this.scale(factor);
    }

    public static randomVectorWithLength(length:number) : Vec2d {
        let angle = Math.random() * (Math.PI * 2);
        return new Vec2d(Math.cos(angle) * length, Math.sin(angle) * length);
    }
}
