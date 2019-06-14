define("Config", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.SimulatorConfig = {
        rocketSpawnPoint: [0, 40],
        rocketSize: [1, 8],
        thrusterFreedomInDegrees: 90,
        thrusterMaxIntensity: 20
    };
    exports.RenderConfig = {
        initialCameraPosition: [0, 20]
    };
});
define("Rocket", ["require", "exports", "Config"], function (require, exports, Config_1) {
    "use strict";
    exports.__esModule = true;
    var Rocket = (function () {
        function Rocket(body) {
            this.score = 0;
            this.body = body;
            this.thrusterAngle = 0;
            this.desiredThrusterAngle = 0;
            this.thrusterIntensity = 0;
            this.desiredThrusterIntensity = 0;
        }
        Rocket.prototype.update = function (elapsedSeconds) {
            var thrusterRotationSpeed = 5;
            var thrusterIntensityAcc = 20;
            this.thrusterAngle = this.stepValue(this.desiredThrusterAngle, this.thrusterAngle, thrusterRotationSpeed, elapsedSeconds);
            this.thrusterIntensity = this.stepValue(this.desiredThrusterIntensity, this.thrusterIntensity, thrusterIntensityAcc, elapsedSeconds);
        };
        Rocket.prototype.getPhysicsObject = function () {
            return this.body;
        };
        Rocket.prototype.getAngle = function () {
            var angle = this.body.angle;
            var normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
            return normalized;
        };
        Rocket.prototype.getAngleFactor = function () {
            var angle = this.getAngle();
            var min = -Math.PI;
            var max = Math.PI;
            return ((angle - min) / (max - min));
        };
        Rocket.prototype.getThrusterAngle = function () {
            var angle = this.thrusterAngle;
            var normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
            return normalized;
        };
        Rocket.prototype.getThrusterAngleFactor = function () {
            var halfFreedomInRadians = (Config_1.SimulatorConfig.thrusterFreedomInDegrees * Math.PI / 180.0) / 2.0;
            var angle = this.getThrusterAngle();
            var min = -halfFreedomInRadians;
            var max = halfFreedomInRadians;
            return ((angle - min) / (max - min));
        };
        Rocket.prototype.getThrusterIntensity = function () {
            return this.thrusterIntensity;
        };
        Rocket.prototype.getThrusterIntensityFactor = function () {
            return this.thrusterIntensity / Config_1.SimulatorConfig.thrusterMaxIntensity;
        };
        Rocket.prototype.getPosition = function () {
            return this.body.position;
        };
        Rocket.prototype.setDesiredThrusterIntensityFactor = function (factor) {
            var min = 0;
            var max = Config_1.SimulatorConfig.thrusterMaxIntensity;
            this.desiredThrusterIntensity = min + factor * (max - min);
        };
        Rocket.prototype.setDesiredThrusterAngleFactor = function (factor) {
            var halfFreedomInRadians = (Config_1.SimulatorConfig.thrusterFreedomInDegrees * Math.PI / 180.0) / 2.0;
            var min = -halfFreedomInRadians;
            var max = halfFreedomInRadians;
            this.desiredThrusterAngle = min + factor * (max - min);
        };
        Rocket.prototype.stepValue = function (desiredValue, currentValue, speed, elapsedtime) {
            if (desiredValue < currentValue) {
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
        return Rocket;
    }());
    exports.Rocket = Rocket;
});
define("Simulator", ["require", "exports", "Rocket", "Config"], function (require, exports, Rocket_1, Config_2) {
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
            var rocketShape = new p2.Box({ width: Config_2.SimulatorConfig.rocketSize[0], height: Config_2.SimulatorConfig.rocketSize[1] });
            var rocketBody = new p2.Body({ mass: 1, position: Config_2.SimulatorConfig.rocketSpawnPoint });
            rocketBody.addShape(rocketShape);
            this.world.addBody(rocketBody);
            var rocket = new Rocket_1.Rocket(rocketBody);
            this.rockets.push(rocket);
            return rocket;
        };
        Simulator.prototype.getAllRockets = function () {
            return this.rockets;
        };
        Simulator.prototype.update = function () {
            var elapsedSeconds = 1 / 60;
            this.rockets.forEach(function (rocket) {
                rocket.update(elapsedSeconds);
                var effectiveAngle = rocket.getThrusterAngle() + (Math.PI / 2);
                var forceX = rocket.getThrusterIntensity() * Math.cos(effectiveAngle);
                var forceY = rocket.getThrusterIntensity() * Math.sin(effectiveAngle);
                var posX = 0;
                var posY = -Config_2.SimulatorConfig.rocketSize[1] / 2;
                rocket.getPhysicsObject().applyForceLocal([forceX, forceY], [posX, posY]);
            });
            this.world.step(elapsedSeconds);
        };
        return Simulator;
    }());
    exports.Simulator = Simulator;
});
define("Renderer", ["require", "exports", "Config"], function (require, exports, Config_3) {
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
            this.cameraPosition = Config_3.RenderConfig.initialCameraPosition;
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
                var screenSpacePosition = _this.toScreenSpace(rocket.getPosition());
                _this.context.translate(screenSpacePosition[0], screenSpacePosition[1]);
                _this.context.rotate(rocket.getAngle());
                var rocketSize = _this.toScreenSpace(Config_3.SimulatorConfig.rocketSize);
                _this.context.strokeRect(-rocketSize[0] / 2, -rocketSize[1] / 2, rocketSize[0], rocketSize[1]);
                var angleOffset = 90 * Math.PI / 180;
                _this.context.translate(0, -rocketSize[1] / 2);
                _this.context.rotate(rocket.getThrusterAngle() + angleOffset);
                _this.context.strokeRect(-rocketSize[0] / 2, 0, -rocket.getThrusterIntensityFactor() * rocketSize[1], 0);
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
            var handle = this.simulator.addRocket();
            handle.setDesiredThrusterIntensityFactor(0.0);
            handle.setDesiredThrusterAngleFactor(0.5);
            setTimeout(function () {
                handle.setDesiredThrusterIntensityFactor(1.0);
            }, 1500);
        };
        Application.prototype.update = function () {
            this.simulator.update();
            this.renderer.draw();
        };
        return Application;
    }());
    exports.Application = Application;
});
