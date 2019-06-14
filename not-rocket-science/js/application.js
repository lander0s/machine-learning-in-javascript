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
            this.finishSimulationCallbacks = [];
        }
        Rocket.prototype.update = function (elapsedSeconds) {
            var thrusterRotationSpeed = 5;
            var thrusterIntensityAcc = 50;
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
        Rocket.prototype.notifySimulationFinished = function () {
            this.finishSimulationCallbacks.forEach(function (callback) { return callback(); });
        };
        Rocket.prototype.on = function (eventType, callback) {
            switch (eventType) {
                case 'finishSimulation': {
                    this.finishSimulationCallbacks.push(callback);
                    break;
                }
                default: {
                    console.error('unknown event type');
                    break;
                }
            }
        };
        return Rocket;
    }());
    exports.Rocket = Rocket;
});
define("Simulator", ["require", "exports", "Rocket", "Config"], function (require, exports, Rocket_1, Config_2) {
    "use strict";
    exports.__esModule = true;
    var COLLISION_GROUP_GROUND = Math.pow(2, 0);
    var COLLISION_GROUP_ROCKET = Math.pow(2, 1);
    var Simulator = (function () {
        function Simulator() {
        }
        Simulator.prototype.init = function () {
            this.world = new p2.World();
            var planeShape = new p2.Plane();
            planeShape.collisionMask = COLLISION_GROUP_ROCKET;
            planeShape.collisionGroup = COLLISION_GROUP_GROUND;
            this.ground = new p2.Body();
            this.ground.addShape(planeShape);
            this.world.addBody(this.ground);
            this.rockets = [];
        };
        Simulator.prototype.addRocket = function () {
            var rocketShape = new p2.Box({ width: Config_2.SimulatorConfig.rocketSize[0], height: Config_2.SimulatorConfig.rocketSize[1] });
            var rocketBody = new p2.Body({ mass: 1, position: Config_2.SimulatorConfig.rocketSpawnPoint });
            rocketBody.addShape(rocketShape);
            rocketShape.collisionMask = COLLISION_GROUP_GROUND;
            rocketShape.collisionGroup = COLLISION_GROUP_ROCKET;
            this.world.addBody(rocketBody);
            var rocket = new Rocket_1.Rocket(rocketBody);
            this.rockets.push(rocket);
            this.applyRandomImpulse(rocket);
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
        Simulator.prototype.applyRandomImpulse = function (rocket) {
            var forceX = (Math.random() * 2 - 1) * 20;
            var forceY = (Math.random() * 2 - 1) * 20;
            var posX = (Math.random() * 2 + 1) * Config_2.SimulatorConfig.rocketSize[0];
            var posY = 0;
            rocket.getPhysicsObject().applyImpulseLocal([forceX, forceY], [posX, posY]);
        };
        return Simulator;
    }());
    exports.Simulator = Simulator;
});
define("FireGFX", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var FireGFX = (function () {
        function FireGFX(canvas, context) {
            this.canvas = canvas;
            this.context = context;
            this.texture = new Image();
            this.texture.src = './res/fire-gfx-texture.png';
            this.time = 0;
        }
        FireGFX.prototype.draw = function (factor, size) {
            var copies = 18;
            for (var i = 0; i < copies; i++) {
                var degreeOffset = (this.time + i * 20) * Math.PI / 180;
                var scale = (Math.cos(degreeOffset) + 4) * 0.5;
                this.context.save();
                this.context.globalAlpha = 0.1;
                this.context.scale(scale * 2, scale);
                this.context.scale(factor, factor);
                this.context.rotate((Math.random() - 0.5) * 0.04);
                this.context.drawImage(this.texture, -size[0] / 2, -size[1] * 0.95, size[0], size[1]);
                this.context.restore();
            }
        };
        FireGFX.prototype.update = function () {
            this.time += 5;
        };
        return FireGFX;
    }());
    exports.FireGFX = FireGFX;
});
define("Renderer", ["require", "exports", "Config", "FireGFX"], function (require, exports, Config_3, FireGFX_1) {
    "use strict";
    exports.__esModule = true;
    var Renderer = (function () {
        function Renderer(selector, simulator) {
            var _this = this;
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
            this.fireGFX = new FireGFX_1.FireGFX(this.canvas, this.context);
            window.addEventListener('wheel', function (e) { return _this.onMouseWheel(e); });
            this.scale = 20;
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
                _this.context.translate(0, -rocketSize[1] / 2);
                _this.context.rotate(rocket.getThrusterAngle());
                _this.fireGFX.draw(rocket.getThrusterIntensityFactor(), _this.toScreenSpace(Config_3.SimulatorConfig.rocketSize));
                _this.context.restore();
            });
            this.fireGFX.update();
        };
        Renderer.prototype.drawGround = function () {
            this.context.beginPath();
            this.context.moveTo(-this.canvas.width * 100, 0);
            this.context.lineTo(this.canvas.width * 100, 0);
            this.context.lineWidth = 5;
            this.context.strokeStyle = 'black';
            this.context.stroke();
        };
        Renderer.prototype.toScreenSpace = function (worldSpacePosition) {
            var screenSpacePosition = [
                worldSpacePosition[0] * this.scale,
                worldSpacePosition[1] * this.scale,
            ];
            return screenSpacePosition;
        };
        Renderer.prototype.onMouseWheel = function (e) {
            this.scale += -e.deltaY * 0.01;
            if (this.scale < 1) {
                this.scale = 1;
            }
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
            var rocket = this.simulator.addRocket();
            rocket.setDesiredThrusterIntensityFactor(0.0);
            rocket.setDesiredThrusterAngleFactor(0.5);
            setTimeout(function () {
                rocket.setDesiredThrusterIntensityFactor(1.0);
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
