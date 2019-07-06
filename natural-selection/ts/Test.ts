import { Vec2d } from './Vec2d'

export class Test {

    public runTest() {
        this.test1();
        this.test2();
        this.test3();
    }

    public test1() : void {
        let angleInDeg = Vec2d.Right.getAngle(Vec2d.Up) / Math.PI * 180;
        if(angleInDeg != 90) {
            console.error('test1 failed (Vec2d.ts)', angleInDeg);
        }
        else {
            console.log('test1 succeed', angleInDeg);
        }
    }

    public test2() : void {
        let angleInDeg = Vec2d.Right.getAngle(Vec2d.Down) / Math.PI * 180;
        if(angleInDeg != 270) {
            console.error('test2 failed (Vec2d.ts)', angleInDeg);
        }
        else {
            console.log('test2 succeed', angleInDeg);
        }
    }

    public test3() : void {
        let vec = Vec2d.Up.scale(5);
        let clamped = vec.clampLength(1);
        if(clamped.length() != 1) {
            console.error('test3 failed (Vec2d.clampLength)', clamped.length());
        } else {
            console.log('test3 succeed', clamped.length());
        }
    }
}