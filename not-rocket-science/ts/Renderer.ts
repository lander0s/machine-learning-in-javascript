import { Simulator } from './Simulator'
import { RenderConfig, SimulatorConfig } from './Config';

export class Renderer {    
    private rootElem       : HTMLElement;
    private canvas         : HTMLCanvasElement;
    private context        : CanvasRenderingContext2D;
    private simulator      : Simulator;
    private cameraPosition : Array<number>;
    private scale          : number;

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
        this.cameraPosition = RenderConfig.initialCameraPosition;
    }

    public init() : void {

    }

    public draw() : void {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);

        this.context.save();
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.context.scale(1, -1);

        let cameraScreenSpacePosition = this.toScreenSpace(this.cameraPosition);
        this.context.translate(
            -cameraScreenSpacePosition[0],
            -cameraScreenSpacePosition[1]
        );

        this.drawGround();
        this.drawRockets();

        this.context.restore();
    }

    private drawRockets() {
        let rockets = this.simulator.getAllRockets();
        rockets.forEach((rocket) => {
            
            this.context.save();
            let screenSpacePosition = this.toScreenSpace(rocket.getPosition());
            this.context.translate(screenSpacePosition[0], screenSpacePosition[1]);
            this.context.rotate(rocket.getAngle());
            let rocketSize = this.toScreenSpace(SimulatorConfig.rocketSize);
            this.context.strokeRect(-rocketSize[0]/2, -rocketSize[1]/2, rocketSize[0], rocketSize[1]);

            // thruster
            let angleOffset = 90 * Math.PI / 180;
            this.context.translate(0, - rocketSize[1]/2 );
            this.context.rotate(rocket.getThrusterAngle() + angleOffset);
            this.context.strokeRect(-rocketSize[0]/2, 0, -rocket.getThrusterIntensity() * 10, 0);

            this.context.restore();
        });
    }

    private drawGround() {
        this.context.beginPath();
        this.context.moveTo(- this.canvas.width/2, 0);
        this.context.lineTo(this.canvas.width/2, 0);
        this.context.lineWidth = 5;
        this.context.strokeStyle = 'black';
        this.context.stroke();
    }

    private toScreenSpace(worldSpacePosition:Array<number>) : Array<number> {
        let mtsToPixelFactor = 20;
        let screenSpacePosition = [
            worldSpacePosition[0] * mtsToPixelFactor,
            worldSpacePosition[1] * mtsToPixelFactor,
        ];
        return screenSpacePosition;
    }
}