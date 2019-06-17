import { Simulator } from './Simulator'
import { RenderConfig, SimulatorConfig } from './Config';
import { FireGFX } from './FireGFX';

export class Renderer {    
    private rootElem       : HTMLElement;
    private canvas         : HTMLCanvasElement;
    private context        : CanvasRenderingContext2D;
    private simulator      : Simulator;
    private cameraPosition : Array<number>;
    private scale          : number;
    private fireGFX        : FireGFX;
    private rocketTexture  : HTMLImageElement;
    private moonTexture    : HTMLImageElement;
    private stars          : Array<Array<number>>;

    constructor(selector:string, simulator: Simulator) {
        this.simulator = simulator;
        this.rootElem = document.querySelector(selector);
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext('2d');
        this.rootElem.style.position = 'absolute';
        this.rootElem.style.width = '100%';
        this.rootElem.style.height = '100%';
        this.rootElem.appendChild(this.canvas);
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.backgroundColor = '#1b2124';
        this.cameraPosition = RenderConfig.initialCameraPosition;
        this.fireGFX = new FireGFX(this.canvas, this.context);
        window.addEventListener('wheel', (e) => this.onMouseWheel(e) );
        this.scale = 20;
        this.rocketTexture = new Image();
        this.rocketTexture.src = './res/rocket-texture.png';
        this.moonTexture = new Image();
        this.stars = [];
        this.moonTexture.src = './res/moon.png';
        for(let i = 0; i  < 100; i++) {
            this.stars.push([
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
            ]);
        }
    }

    public init() : void {

    }

    public draw() : void {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);

        this.context.save();
        this.drawSky();
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.context.scale(1, -1);
        let cameraScreenSpacePosition = this.toScreenSpace(this.cameraPosition);
        this.context.translate(
            -cameraScreenSpacePosition[0],
            -cameraScreenSpacePosition[1]
        );
        this.context.lineWidth = 0.4 * this.scale;
        this.drawGround();
        this.drawRockets();
        this.context.restore();
    }

    private drawRockets() {
        let rockets = this.simulator.getAllRockets();
        for(let i = 0; i < rockets.length; i++) {
            let rocket = rockets[i];

            this.context.save();
            this.context.globalAlpha *= (i == 0 ? 1.0 : 0.02);
            let screenSpacePosition = this.toScreenSpace(rocket.getPosition());
            this.context.translate(screenSpacePosition[0], screenSpacePosition[1]);
            this.context.rotate(rocket.getAngle());
            let rocketSize = this.toScreenSpace(SimulatorConfig.rocketSize);
            this.context.drawImage(this.rocketTexture, -rocketSize[0]/2, -rocketSize[1]/2, rocketSize[0], rocketSize[1]);

            // thruster
            this.context.save();
            this.context.translate(0, - rocketSize[1]/2 );
            this.context.rotate(rocket.getThrusterAngle());
            this.fireGFX.draw(rocket.getThrusterIntensityFactor(), this.toScreenSpace(SimulatorConfig.rocketSize));
            this.context.restore();

            // score
            this.context.save();
            this.context.translate(0, rocketSize[1]/2);
            this.context.rotate( - rocket.getAngle());
            this.context.font = '30px arial';
            this.context.textAlign = 'center';
            this.context.fillStyle = rocket.getScore() > 0 ? '#00FF00' : '#FF0000';
            this.context.scale(1,-1);
            let offset = [0, -(SimulatorConfig.rocketSize[0] + 1)];
            offset = this.toScreenSpace(offset);
            let text = (rocket.getScore() > 0 ? '+' : '') + rocket.getScore();
            this.context.fillText( text , offset[0], offset[1]);
            this.context.restore();

            this.context.restore();
        }

        this.fireGFX.update();
    }

    private drawSky() : void {
        this.context.save();
        this.context.drawImage(this.moonTexture, 100, 100, 50, 50);
        this.context.fillStyle = 'white';
        for(let i = 0; i < this.stars.length; i++) {
            this.context.save();
            this.context.fillRect(this.stars[i][0] - 1 , this.stars[i][1] - 1, 2, 2);
            this.context.globalAlpha *= Math.random();
            let coronaSize = Math.random() * 5;
            let halfCoronaSize = coronaSize/2;
            this.context.fillRect(this.stars[i][0] - halfCoronaSize, this.stars[i][1] - halfCoronaSize, coronaSize, coronaSize);
            this.context.restore();    
        }
        this.context.restore();
    }

    private drawGround() {
        this.context.beginPath();
        this.context.moveTo(- this.canvas.width*100, 0);
        this.context.lineTo(this.canvas.width*100, 0);
        this.context.strokeStyle = 'black';
        this.context.stroke();
    }

    private toScreenSpace(worldSpacePosition:Array<number>) : Array<number> {
        let screenSpacePosition = [
            worldSpacePosition[0] * this.scale,
            worldSpacePosition[1] * this.scale,
        ];
        return screenSpacePosition;
    }

    private onMouseWheel(e:MouseWheelEvent) : void {
        this.scale += -e.deltaY * 0.01;
        if(this.scale < 1) {
            this.scale = 1;
        }
    }
}