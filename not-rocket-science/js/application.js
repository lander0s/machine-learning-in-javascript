define("Rocket", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var RocketHandle = (function () {
        function RocketHandle(rocket) {
            this.rocket = rocket;
            this.rocket.handle = this;
            this.onSimulationFinished = function () { };
        }
        RocketHandle.prototype.getRocketAngle = function () {
            return this.rocket.body.angle;
        };
        RocketHandle.prototype.getRocketPosition = function () {
            return this.rocket.body.position;
        };
        RocketHandle.prototype.getTurbineAngle = function () {
            return this.rocket.turbineAngle;
        };
        RocketHandle.prototype.getTurbineIntesity = function () {
            return this.rocket.turbineIntensity;
        };
        RocketHandle.prototype.getScore = function () {
            return this.rocket.score;
        };
        RocketHandle.prototype.setDesiredTurbineAngle = function (angle) {
            this.rocket.desiredTurbineAngle = angle;
        };
        RocketHandle.prototype.setDesiredTurbineIntensity = function (intesity) {
            this.rocket.desiredTurbineIntensity = intesity;
        };
        return RocketHandle;
    }());
    exports.RocketHandle = RocketHandle;
    var Rocket = (function () {
        function Rocket(body) {
            this.score = 0;
            this.body = body;
            this.turbineAngle = 0;
            this.desiredTurbineAngle = 0;
            this.turbineIntensity = 0;
            this.desiredTurbineIntensity = 0;
            this.handle = null;
        }
        return Rocket;
    }());
    exports.Rocket = Rocket;
});
define("Config", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.SimulatorConfig = {
        rocketSpawnPoint: [0, 40],
        rocketSize: [1, 8]
    };
    exports.RenderConfig = {
        initialCameraPosition: [0, 20]
    };
});
define("Simulator", ["require", "exports", "Rocket", "Config"], function (require, exports, Rocket_1, Config_1) {
    "use strict";
    exports.__esModule = true;
    var Simulator = (function () {
        function Simulator() {
        }
        Simulator.prototype.init = function () {
            this.world = new p2.World();
            var planeShape = new p2.Plane();
            this.ground = new p2.Body();
            this.ground.addShape(planeShape);
            this.world.addBody(this.ground);
            this.rockets = [];
        };
        Simulator.prototype.addRocket = function () {
            var rocketShape = new p2.Box({ width: Config_1.SimulatorConfig.rocketSize[0], height: Config_1.SimulatorConfig.rocketSize[1] });
            var rocketBody = new p2.Body({ mass: 1, position: Config_1.SimulatorConfig.rocketSpawnPoint });
            rocketBody.addShape(rocketShape);
            this.world.addBody(rocketBody);
            var rocket = new Rocket_1.Rocket(rocketBody);
            this.rockets.push(rocket);
            var handle = new Rocket_1.RocketHandle(rocket);
            return handle;
        };
        Simulator.prototype.getAllRockets = function () {
            return this.rockets;
        };
        Simulator.prototype.update = function () {
            var _this = this;
            var elapsedSeconds = 1 / 60;
            var turbineRotationSpeed = 1;
            var turbineIntensityAcc = 1;
            this.rockets.forEach(function (rocket) {
                rocket.turbineAngle = _this.stepValue(rocket.desiredTurbineAngle, rocket.turbineAngle, turbineRotationSpeed, elapsedSeconds);
                rocket.turbineIntensity = _this.stepValue(rocket.desiredTurbineIntensity, rocket.turbineIntensity, turbineIntensityAcc, elapsedSeconds);
                var angleOffset = 90 * Math.PI / 180;
                var forceX = rocket.turbineIntensity * Math.cos(rocket.turbineAngle + angleOffset);
                var forceY = rocket.turbineIntensity * Math.sin(rocket.turbineAngle + angleOffset);
                var posX = 0;
                var posY = -Config_1.SimulatorConfig.rocketSize[1] / 2;
                rocket.body.applyForceLocal([forceX, forceY], [posX, posY]);
            });
            this.world.step(elapsedSeconds);
        };
        Simulator.prototype.stepValue = function (desiredValue, currentValue, speed, elapsedtime) {
            if (desiredValue > currentValue) {
                var step = -speed * elapsedtime;
                if (currentValue + step < desiredValue)
                    return desiredValue;
                return currentValue + step;
            }
            else {
                var step = speed * elapsedtime;
                if (currentValue + step > desiredValue)
                    return desiredValue;
                return currentValue + step;
            }
        };
        return Simulator;
    }());
    exports.Simulator = Simulator;
});
define("Renderer", ["require", "exports", "Config"], function (require, exports, Config_2) {
    "use strict";
    exports.__esModule = true;
    var Renderer = (function () {
        function Renderer(selector, simulator) {
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
            this.cameraPosition = Config_2.RenderConfig.initialCameraPosition;
        }
        Renderer.prototype.init = function () {
        };
        Renderer.prototype.draw = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.save();
            this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.context.scale(1, -1);
            var cameraScreenSpacePosition = this.toScreenSpace(this.cameraPosition);
            this.context.translate(-cameraScreenSpacePosition[0], -cameraScreenSpacePosition[1]);
            this.drawGround();
            this.drawRockets();
            this.context.restore();
        };
        Renderer.prototype.drawRockets = function () {
            var _this = this;
            var rockets = this.simulator.getAllRockets();
            rockets.forEach(function (rocket) {
                _this.context.save();
                var screenSpacePosition = _this.toScreenSpace(rocket.body.position);
                _this.context.translate(screenSpacePosition[0], screenSpacePosition[1]);
                _this.context.rotate(rocket.body.angle);
                var rocketSize = _this.toScreenSpace(Config_2.SimulatorConfig.rocketSize);
                _this.context.strokeRect(-rocketSize[0] / 2, -rocketSize[1] / 2, rocketSize[0], rocketSize[1]);
                var angleOffset = 90 * Math.PI / 180;
                _this.context.translate(0, -rocketSize[1] / 2);
                _this.context.rotate(rocket.turbineAngle + angleOffset);
                _this.context.strokeRect(-rocketSize[0] / 2, 0, -rocket.desiredTurbineIntensity * 10, 0);
                _this.context.restore();
            });
        };
        Renderer.prototype.drawGround = function () {
            this.context.beginPath();
            this.context.moveTo(-this.canvas.width / 2, 0);
            this.context.lineTo(this.canvas.width / 2, 0);
            this.context.lineWidth = 5;
            this.context.strokeStyle = 'black';
            this.context.stroke();
        };
        Renderer.prototype.toScreenSpace = function (worldSpacePosition) {
            var mtsToPixelFactor = 20;
            var screenSpacePosition = [
                worldSpacePosition[0] * mtsToPixelFactor,
                worldSpacePosition[1] * mtsToPixelFactor,
            ];
            return screenSpacePosition;
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
});
define("Application", ["require", "exports", "Simulator", "Renderer"], function (require, exports, Simulator_1, Renderer_1) {
    "use strict";
    exports.__esModule = true;
    var Application = (function () {
        function Application() {
            this.simulator = new Simulator_1.Simulator();
            this.renderer = new Renderer_1.Renderer('#render-surface', this.simulator);
        }
        Application.prototype.init = function () {
            this.renderer.init();
            this.simulator.init();
            this.simulator.addRocket();
        };
        Application.prototype.update = function () {
            this.simulator.update();
            this.renderer.draw();
        };
        return Application;
    }());
    exports.Application = Application;
});
