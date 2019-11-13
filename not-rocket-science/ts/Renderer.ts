import { Simulator } from './Simulator'
import { SimulatorConfig } from './Config';
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
    private marsTexture    : HTMLImageElement;
    private marsTexturePattern: CanvasPattern;
    private fuelIcon       : HTMLImageElement;
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
        this.fireGFX = new FireGFX(this.canvas, this.context);
        window.addEventListener('wheel', (e) => this.onMouseWheel(e) );
        this.scale = 10;
        this.fuelIcon = new Image();
        this.fuelIcon.src = './res/fuel-icon.png';
        this.rocketTexture = new Image();
        this.rocketTexture.src = './res/rocket-texture.png';
        this.moonTexture = new Image();
        this.moonTexture.src = './res/moon.png';
        this.marsTexture = new Image();
        this.marsTexture.src = './res/mars-texture.jpg';
        this.marsTexture.onload = () => {
            this.marsTexturePattern = this.context.createPattern(this.marsTexture, 'repeat');
        }
        this.stars = [];
        for(let i = 0; i  < 100; i++) {
            this.stars.push([
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
            ]);
        }
        this.cameraPosition = [];
        this.updateCameraPosition();
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
            this.context.globalAlpha *= (i == 0 ? 1.0 : 0.1);
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
            this.context.font = '20px arial';
            this.context.textAlign = 'center';
            this.context.scale(1,-1);
            this.context.lineWidth = 2;
            let offsetLine1 = [0, -(SimulatorConfig.rocketSize[0] + 10)];
            let offsetLine2 = [0, -(SimulatorConfig.rocketSize[0] + 40)];
            let offsetLine3 = [0, -(SimulatorConfig.rocketSize[0] + 80)];
            this.context.fillStyle = rocket.getScore() > 0 ? '#00FF00' : '#FF0000';
            let plusSign = rocket.getScore() > 0 ? "+" : "";
            this.context.fillText( `${plusSign}${rocket.getScore()|0}` , offsetLine1[0], offsetLine1[1]);
            this.context.fillStyle = '#FFFFFF';
            this.context.strokeStyle = '#FFFFFF';
            this.context.fillText( `${rocket.getGenome().getId()}` , offsetLine2[0], offsetLine2[1]);
            this.context.strokeRect(offsetLine3[0]-50, offsetLine3[1] , 100, 10);
            this.context.fillRect(offsetLine3[0]-50, offsetLine3[1] , 100 * rocket.getFuelTankReservePercentage(), 10);
            this.context.drawImage(this.fuelIcon, offsetLine3[0]-80, offsetLine3[1] - 5 , 20, 20);
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
        this.context.save();
        this.context.fillStyle = this.marsTexturePattern;
        let scaleFactor = this.scale / 20;
        let min = 0.5;
        let max = 1.0;
        let textureScale = min +  scaleFactor * (max - min);
        let x = (-this.canvas.width/2) * textureScale;
        let y = 0 * textureScale;
        let width = this.canvas.width * textureScale;
        let height = this.canvas.height * textureScale;
        this.context.scale(textureScale, textureScale);
        this.context.fillRect(x / scaleFactor, y, width / scaleFactor, -height);
        this.context.restore();
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
        if(this.scale > 20) {
            this.scale = 20;
        }
        this.updateCameraPosition();
    }

    private updateCameraPosition() : void {
        let screenHeightInMts = window.innerHeight / this.scale;
        this.cameraPosition[0] = 0;
        this.cameraPosition[1] = (screenHeightInMts / 2);
        let scaleFactor = 1.0 - (this.scale / 20.0);
        let min = 10;
        let max = 100;
        let cameraOffset = min +  scaleFactor * (max - min);
        this.cameraPosition[1] -= cameraOffset / this.scale;
    }
}