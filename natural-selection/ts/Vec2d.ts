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
    
    
    distance(v : Vec2d) {
        return (v.subtract(this)).norm();
    }
    
    mult(scalar : number) {
        return new Vec2d(this.x * scalar, this.y * scalar);
    }
    
    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() : Vec2d {
        let norm = this.norm();

        return new Vec2d(this.x / norm, this.y / norm);
    }

    subtract(v : Vec2d) : Vec2d {        
        return new Vec2d(this.x - v.x, this.y - v.y);
    }
    
    scalarMult(a : number) : Vec2d {
        return new Vec2d(this.x * a, this.y * a);
    }


    toString() : string {
        return "(" + this.x + ", " + this.y + ")";
    }
}
