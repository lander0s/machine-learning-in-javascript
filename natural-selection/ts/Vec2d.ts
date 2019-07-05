export class Vec2d {
    
    x : number = 0;
    y : number = 0;
    
    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }
    
    add(v : Vec2d) : Vec2d {        
        return new Vec2d(this.x + v.x, this.y + v.y);
    }
    
    
    copy() : Vec2d {        
        return new Vec2d(this.x, this.y);
    }
    
    
    distance(v : Vec2d) : number {
        return (v.subtract(this)).length();
    }
    
    multiply(scalar : number) : Vec2d {
        return new Vec2d(this.x * scalar, this.y * scalar);
    }
    
    length() :number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() : Vec2d {
        let len = this.length();

        return new Vec2d(this.x / len, this.y / len);
    }

    subtract(v : Vec2d) : Vec2d {        
        return new Vec2d(this.x - v.x, this.y - v.y);
    }

    toString() : string {
        return "(" + this.x + ", " + this.y + ")";
    }
}
