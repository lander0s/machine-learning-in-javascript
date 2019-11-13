define("Config", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.SimulatorConfig = {
        rocketSpawnPoint: [0, 100],
        rocketSize: [1, 8],
        thrusterFreedomInDegrees: 90,
        thrusterMaxIntensity: 20,
        fuelTankCapacity: 5 * 60,
        fuelConsumptionRate: 1,
        secondsToRemoveDeadRockets: 0
    };
    exports.LearnerConfig = {
        generationSize: 12
    };
});
define("Genome", ["require", "exports", "Config"], function (require, exports, Config_1) {
    "use strict";
    exports.__esModule = true;
    var Genome = (function () {
        function Genome(generation, id) {
            this.generation = 0;
            this.network = null;
            this.rocket = null;
            this.generation = generation;
            this.id = id;
            this.rocket = null;
            this.fitness = -99999;
        }
        Genome.prototype.init = function (rocket, daddy, mum) {
            if (daddy === void 0) { daddy = null; }
            if (mum === void 0) { mum = null; }
            this.rocket = rocket;
            this.rocket.setGenome(this);
            if (this.network == null) {
                if (daddy != null && mum != null) {
                    this.createNeuralNetworkFromParents(daddy, mum);
                }
                else {
                    this.createNeuralNetworkFromScratch();
                }
            }
        };
        Genome.prototype.createNeuralNetworkFromScratch = function () {
            this.network = new synaptic.Architect.Perceptron(5, 4, 2);
        };
        Genome.prototype.createNeuralNetworkFromParents = function (daddy, mum) {
            var daddyNetworkJsonObj = JSON.parse(JSON.stringify(daddy.network.toJSON()));
            var mumNetworkJsonObj = JSON.parse(JSON.stringify(mum.network.toJSON()));
            var childNetworkJsonObj = this.crossOver(daddyNetworkJsonObj, mumNetworkJsonObj);
            var mutatedNetworkJsonObj = this.mutate(childNetworkJsonObj);
            this.network = synaptic.Network.fromJSON(mutatedNetworkJsonObj);
        };
        Genome.prototype.update = function () {
            var angularVelocityClamp = 30;
            var heightClamp = 100;
            var isRotatingClockWise = this.rocket.getAngularVelocity() < 0;
            var isTiltedToRight = this.rocket.getAngle() < 0;
            var absAngularVelocity = Math.min(Math.abs(this.rocket.getAngularVelocity()), angularVelocityClamp);
            var absAngle = Math.abs(this.rocket.getAngle());
            var heightFactor = Math.min(this.rocket.getPosition()[1] / heightClamp, 1.0);
            var input = [
                isRotatingClockWise ? 1.0 : 0.0,
                isTiltedToRight ? 1.0 : 0.0,
                absAngularVelocity / angularVelocityClamp,
                absAngle / Math.PI,
                heightFactor
            ];
            var output = this.network.activate(input);
            this.rocket.setDesiredThrusterAngleFactor(output[0]);
            this.rocket.setDesiredThrusterIntensityFactor(output[1]);
            if (this.rocket.isDead()) {
                this.fitness = this.rocket.getScore();
            }
        };
        Genome.prototype.didFinish = function () {
            return this.rocket.isDead() && this.rocket.getSecondsSinceDeath() >= Config_1.SimulatorConfig.secondsToRemoveDeadRockets;
        };
        Genome.prototype.getFitness = function () {
            return this.fitness;
        };
        Genome.prototype.getGeneration = function () {
            return this.generation;
        };
        Genome.prototype.getId = function () {
            return this.id;
        };
        Genome.prototype.crossOver = function (daddyNetworkJsonObj, mumNetworkJsonObj) {
            var randomCut = (Math.random() * daddyNetworkJsonObj.neurons.length) | 0;
            for (var i = randomCut; i < daddyNetworkJsonObj.neurons.length; i++) {
                var aux = daddyNetworkJsonObj.neurons[i].bias;
                daddyNetworkJsonObj.neurons[i].bias = mumNetworkJsonObj.neurons[i].bias;
                mumNetworkJsonObj.neurons[i].bias = aux;
            }
            if (Math.random() > 0.5) {
                return daddyNetworkJsonObj;
            }
            else {
                return mumNetworkJsonObj;
            }
        };
        Genome.prototype.mutate = function (networkJsonObj) {
            for (var i = 0; i < networkJsonObj.neurons.length; i++) {
                if (Math.random() > 0.5) {
                    networkJsonObj.neurons[i].bias +=
                        networkJsonObj.neurons[i].bias * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
                }
            }
            for (var i = 0; i < networkJsonObj.connections.length; i++) {
                if (Math.random() > 0.5) {
                    networkJsonObj.connections[i].weight +=
                        networkJsonObj.connections[i].weight * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
                }
            }
            return networkJsonObj;
        };
        Genome.prototype.toJson = function () {
            return {
                generation: this.generation,
                id: this.id,
                fitness: this.fitness,
                network: this.network.toJSON()
            };
        };
        Genome.fromJson = function (jsonObj) {
            var genome = new Genome(-1, '');
            genome.generation = jsonObj.generation;
            genome.id = jsonObj.id;
            genome.network = synaptic.Network.fromJSON(jsonObj.network);
            genome.fitness = jsonObj.fitness;
            return genome;
        };
        return Genome;
    }());
    exports.Genome = Genome;
});
define("Rocket", ["require", "exports", "Config"], function (require, exports, Config_2) {
    "use strict";
    exports.__esModule = true;
    var Rocket = (function () {
        function Rocket(body) {
            this.isAlive = true;
            this.isLanded = false;
            this.score = 0;
            this.body = body;
            this.thrusterAngle = 0;
            this.desiredThrusterAngle = 0;
            this.thrusterIntensity = 0;
            this.desiredThrusterIntensity = 0;
            this.fuelTankReserve = Config_2.SimulatorConfig.fuelTankCapacity;
            this.genome = null;
        }
        Rocket.prototype.update = function (elapsedSeconds) {
            var thrusterRotationSpeed = 5;
            var thrusterIntensityAcc = 50;
            this.thrusterAngle = this.stepValue(this.desiredThrusterAngle, this.thrusterAngle, thrusterRotationSpeed, elapsedSeconds);
            this.thrusterIntensity = this.stepValue(this.desiredThrusterIntensity, this.thrusterIntensity, thrusterIntensityAcc, elapsedSeconds);
            this.thrusterIntensity *= this.getEngineEfficiency();
            this.consumeFuel();
            this.updateScore();
        };
        Rocket.prototype.updateScore = function () {
            if (this.isAlive) {
                if (this.getFuelTankReservePercentage() > 0 || (this.getFuelTankReservePercentage() == 0 && this.isLanded)) {
                    if (this.body.velocity[1] <= 0) {
                        var angularScore = 2.0 * Math.cos(this.getAngle()) - 1.0;
                        var deadlySpeed = 5.0;
                        var spinScore = 1.0 - Math.abs(this.getAngularVelocity()) / deadlySpeed;
                        this.score += spinScore + angularScore;
                    }
                }
                if (this.score < -250) {
                    this.score -= 9750;
                    this.markAsDead();
                }
                if (this.isLanded) {
                    var elapsedtime = new Date().getTime() - this.landingTimestamp;
                    if (elapsedtime >= 3000) {
                        this.markAsDead();
                    }
                }
            }
        };
        Rocket.prototype.judgeLanding = function () {
            var angularScore = 2.0 * Math.cos(this.getAngle()) - 1.0;
            var deadlySpeed = 5.0;
            var spinScore = 1.0 - Math.abs(this.getAngularVelocity()) / deadlySpeed;
            var linearSpeed = Math.sqrt(this.body.velocity[0] * this.body.velocity[0] + this.body.velocity[1] * this.body.velocity[1]);
            var speedScore = 1.0 - linearSpeed / (deadlySpeed * 2.0);
            this.score += 1000 * (spinScore + angularScore + speedScore);
            this.isLanded = true;
            this.landingTimestamp = new Date().getTime();
            if (speedScore < 0) {
                this.markAsDead();
            }
        };
        Rocket.prototype.getScore = function () {
            return this.score;
        };
        Rocket.prototype.getPhysicsObject = function () {
            return this.body;
        };
        Rocket.prototype.getAngle = function () {
            var angle = this.body.angle;
            var normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
            return normalized;
        };
        Rocket.prototype.getAngularVelocity = function () {
            return this.body.angularVelocity;
        };
        Rocket.prototype.getThrusterAngle = function () {
            var angle = this.thrusterAngle;
            var normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
            return normalized;
        };
        Rocket.prototype.getThrusterIntensity = function () {
            return this.thrusterIntensity;
        };
        Rocket.prototype.getThrusterIntensityFactor = function () {
            return this.thrusterIntensity / Config_2.SimulatorConfig.thrusterMaxIntensity;
        };
        Rocket.prototype.getPosition = function () {
            return this.body.position;
        };
        Rocket.prototype.setDesiredThrusterIntensityFactor = function (factor) {
            var min = 0;
            var max = Config_2.SimulatorConfig.thrusterMaxIntensity;
            this.desiredThrusterIntensity = min + factor * (max - min);
        };
        Rocket.prototype.setDesiredThrusterAngleFactor = function (factor) {
            var halfFreedomInRadians = (Config_2.SimulatorConfig.thrusterFreedomInDegrees * Math.PI / 180.0) / 2.0;
            var min = -halfFreedomInRadians;
            var max = halfFreedomInRadians;
            this.desiredThrusterAngle = min + factor * (max - min);
        };
        Rocket.prototype.getFuelTankReservePercentage = function () {
            return this.fuelTankReserve / Config_2.SimulatorConfig.fuelTankCapacity;
        };
        Rocket.prototype.consumeFuel = function () {
            var fuelConsumption = this.getThrusterIntensityFactor() * Config_2.SimulatorConfig.fuelConsumptionRate;
            this.fuelTankReserve -= fuelConsumption;
            if (this.fuelTankReserve < 0) {
                this.fuelTankReserve = 0;
                return false;
            }
            return true;
        };
        Rocket.prototype.getEngineEfficiency = function () {
            var influenceThreshold = 90;
            var reductionRate = 0.025;
            var efficiencyReduction = 0;
            if (influenceThreshold >= this.fuelTankReserve) {
                var influenceRatio = 1 - (influenceThreshold - this.fuelTankReserve) / influenceThreshold;
                efficiencyReduction = Math.max(reductionRate * Math.log(influenceRatio), -1);
            }
            return Math.min(1 + efficiencyReduction, 1);
        };
        Rocket.prototype.markAsDead = function () {
            if (this.isAlive) {
                this.isAlive = false;
                this.deathTimestamp = new Date().getTime();
            }
        };
        Rocket.prototype.isDead = function () {
            return !this.isAlive;
        };
        Rocket.prototype.hasLanded = function () {
            return this.isLanded;
        };
        Rocket.prototype.getSecondsSinceDeath = function () {
            return (new Date().getTime() - this.deathTimestamp) / 1000;
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
        Rocket.prototype.getGenome = function () {
            return this.genome;
        };
        Rocket.prototype.setGenome = function (genome) {
            this.genome = genome;
        };
        return Rocket;
    }());
    exports.Rocket = Rocket;
});
define("Simulator", ["require", "exports", "Rocket", "Config"], function (require, exports, Rocket_1, Config_3) {
    "use strict";
    exports.__esModule = true;
    var COLLISION_GROUP_GROUND = Math.pow(2, 0);
    var COLLISION_GROUP_ROCKET = Math.pow(2, 1);
    var Simulator = (function () {
        function Simulator() {
        }
        Simulator.prototype.init = function () {
            var _this = this;
            this.world = new p2.World();
            var planeShape = new p2.Plane();
            planeShape.collisionMask = COLLISION_GROUP_ROCKET;
            planeShape.collisionGroup = COLLISION_GROUP_GROUND;
            this.ground = new p2.Body();
            this.ground.addShape(planeShape);
            this.world.addBody(this.ground);
            this.rockets = [];
            this.world.on('beginContact', function (e) { return _this.onBeginContact(e); });
        };
        Simulator.prototype.addRocket = function () {
            var rocketShape = new p2.Box({ width: Config_3.SimulatorConfig.rocketSize[0], height: Config_3.SimulatorConfig.rocketSize[1] });
            var rocketBody = new p2.Body({ mass: 1, position: Config_3.SimulatorConfig.rocketSpawnPoint });
            rocketBody.addShape(rocketShape);
            rocketShape.collisionMask = COLLISION_GROUP_GROUND;
            rocketShape.collisionGroup = COLLISION_GROUP_ROCKET;
            this.world.addBody(rocketBody);
            var rocket = new Rocket_1.Rocket(rocketBody);
            this.rockets.push(rocket);
            rocket.getPhysicsObject().angle = Math.PI;
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
                var posY = -Config_3.SimulatorConfig.rocketSize[1] / 2;
                rocket.getPhysicsObject().applyForceLocal([forceX, forceY], [posX, posY]);
            });
            this.world.step(elapsedSeconds);
            this.removeDeadRockets();
        };
        Simulator.prototype.onBeginContact = function (evt) {
            var theRocket = evt.bodyA.id == this.ground.id ? evt.bodyB : evt.bodyA;
            var rocket = this.getRocketById(theRocket.id);
            if (!rocket.hasLanded()) {
                rocket.judgeLanding();
            }
        };
        Simulator.prototype.getRocketById = function (id) {
            for (var i = 0; i < this.rockets.length; i++) {
                if (this.rockets[i].getPhysicsObject().id == id) {
                    return this.rockets[i];
                }
            }
            console.error('attempt to access an unkown rocket');
            return null;
        };
        Simulator.prototype.getBestRocketIndex = function () {
            var idx = 0;
            var bestScore = -99999999;
            for (var i = 0; i < this.rockets.length; i++) {
                var crtScore = this.rockets[i].getScore();
                if (this.rockets[i].getScore() > bestScore) {
                    idx = i;
                    bestScore = crtScore;
                }
            }
            return idx;
        };
        Simulator.prototype.removeDeadRockets = function () {
            for (var i = this.rockets.length - 1; i >= 0; i--) {
                if (this.rockets[i].isDead() && this.rockets[i].getSecondsSinceDeath() >= Config_3.SimulatorConfig.secondsToRemoveDeadRockets) {
                    var rocket = this.rockets[i];
                    this.world.removeBody(rocket.getPhysicsObject());
                    this.rockets.splice(i, 1);
                }
            }
        };
        Simulator.prototype.removeAllRockets = function () {
            var _this = this;
            this.rockets.forEach(function (rocket) {
                _this.world.removeBody(rocket.getPhysicsObject());
            });
            this.rockets = [];
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
                this.context.globalAlpha *= 0.1;
                this.context.scale(5, scale);
                this.context.scale(factor, factor);
                this.context.rotate((Math.random() - 0.5) * 0.1);
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
define("Renderer", ["require", "exports", "Config", "FireGFX"], function (require, exports, Config_4, FireGFX_1) {
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
            this.canvas.style.backgroundColor = '#1b2124';
            this.fireGFX = new FireGFX_1.FireGFX(this.canvas, this.context);
            window.addEventListener('wheel', function (e) { return _this.onMouseWheel(e); });
            this.scale = 10;
            this.fuelIcon = new Image();
            this.fuelIcon.src = './res/fuel-icon.png';
            this.rocketTexture = new Image();
            this.rocketTexture.src = './res/rocket-texture.png';
            this.moonTexture = new Image();
            this.moonTexture.src = './res/moon.png';
            this.marsTexture = new Image();
            this.marsTexture.src = './res/mars-texture.jpg';
            this.marsTexture.onload = function () {
                _this.marsTexturePattern = _this.context.createPattern(_this.marsTexture, 'repeat');
            };
            this.stars = [];
            for (var i = 0; i < 100; i++) {
                this.stars.push([
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight,
                ]);
            }
            this.cameraPosition = [];
            this.updateCameraPosition();
        }
        Renderer.prototype.init = function () {
        };
        Renderer.prototype.draw = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.save();
            this.drawSky();
            this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.context.scale(1, -1);
            var cameraScreenSpacePosition = this.toScreenSpace(this.cameraPosition);
            this.context.translate(-cameraScreenSpacePosition[0], -cameraScreenSpacePosition[1]);
            this.context.lineWidth = 0.4 * this.scale;
            this.drawGround();
            this.drawRockets();
            this.context.restore();
        };
        Renderer.prototype.drawRockets = function () {
            var rockets = this.simulator.getAllRockets();
            var bestRocketIdx = this.simulator.getBestRocketIndex();
            for (var i = 0; i < rockets.length; i++) {
                var rocket = rockets[i];
                this.context.save();
                this.context.globalAlpha *= (i == 0 ? 1.0 : 0.1);
                var screenSpacePosition = this.toScreenSpace(rocket.getPosition());
                this.context.translate(screenSpacePosition[0], screenSpacePosition[1]);
                this.context.rotate(rocket.getAngle());
                var rocketSize = this.toScreenSpace(Config_4.SimulatorConfig.rocketSize);
                this.context.drawImage(this.rocketTexture, -rocketSize[0] / 2, -rocketSize[1] / 2, rocketSize[0], rocketSize[1]);
                this.context.save();
                this.context.translate(0, -rocketSize[1] / 2);
                this.context.rotate(rocket.getThrusterAngle());
                this.fireGFX.draw(rocket.getThrusterIntensityFactor(), this.toScreenSpace(Config_4.SimulatorConfig.rocketSize));
                this.context.restore();
                this.context.save();
                this.context.translate(0, rocketSize[1] / 2);
                this.context.rotate(-rocket.getAngle());
                this.context.font = '20px arial';
                this.context.textAlign = 'center';
                this.context.scale(1, -1);
                this.context.lineWidth = 2;
                var offsetLine1 = [0, -(Config_4.SimulatorConfig.rocketSize[0] + 10)];
                var offsetLine2 = [0, -(Config_4.SimulatorConfig.rocketSize[0] + 40)];
                var offsetLine3 = [0, -(Config_4.SimulatorConfig.rocketSize[0] + 80)];
                this.context.fillStyle = rocket.getScore() > 0 ? '#00FF00' : '#FF0000';
                var plusSign = rocket.getScore() > 0 ? "+" : "";
                this.context.fillText("" + plusSign + (rocket.getScore() | 0), offsetLine1[0], offsetLine1[1]);
                this.context.fillStyle = '#FFFFFF';
                this.context.strokeStyle = '#FFFFFF';
                this.context.fillText("" + rocket.getGenome().getId(), offsetLine2[0], offsetLine2[1]);
                this.context.strokeRect(offsetLine3[0] - 50, offsetLine3[1], 100, 10);
                this.context.fillRect(offsetLine3[0] - 50, offsetLine3[1], 100 * rocket.getFuelTankReservePercentage(), 10);
                this.context.drawImage(this.fuelIcon, offsetLine3[0] - 80, offsetLine3[1] - 5, 20, 20);
                this.context.restore();
                this.context.restore();
            }
            this.fireGFX.update();
        };
        Renderer.prototype.drawSky = function () {
            this.context.save();
            this.context.drawImage(this.moonTexture, 100, 100, 50, 50);
            this.context.fillStyle = 'white';
            for (var i = 0; i < this.stars.length; i++) {
                this.context.save();
                this.context.fillRect(this.stars[i][0] - 1, this.stars[i][1] - 1, 2, 2);
                this.context.globalAlpha *= Math.random();
                var coronaSize = Math.random() * 5;
                var halfCoronaSize = coronaSize / 2;
                this.context.fillRect(this.stars[i][0] - halfCoronaSize, this.stars[i][1] - halfCoronaSize, coronaSize, coronaSize);
                this.context.restore();
            }
            this.context.restore();
        };
        Renderer.prototype.drawGround = function () {
            this.context.save();
            this.context.fillStyle = this.marsTexturePattern;
            var scaleFactor = this.scale / 20;
            var min = 0.5;
            var max = 1.0;
            var textureScale = min + scaleFactor * (max - min);
            var x = (-this.canvas.width / 2) * textureScale;
            var y = 0 * textureScale;
            var width = this.canvas.width * textureScale;
            var height = this.canvas.height * textureScale;
            this.context.scale(textureScale, textureScale);
            this.context.fillRect(x / scaleFactor, y, width / scaleFactor, -height);
            this.context.restore();
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
            if (this.scale > 20) {
                this.scale = 20;
            }
            this.updateCameraPosition();
        };
        Renderer.prototype.updateCameraPosition = function () {
            var screenHeightInMts = window.innerHeight / this.scale;
            this.cameraPosition[0] = 0;
            this.cameraPosition[1] = (screenHeightInMts / 2);
            var scaleFactor = 1.0 - (this.scale / 20.0);
            var min = 10;
            var max = 100;
            var cameraOffset = min + scaleFactor * (max - min);
            this.cameraPosition[1] -= cameraOffset / this.scale;
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
});
define("Leaderboard", ["require", "exports", "Genome"], function (require, exports, Genome_1) {
    "use strict";
    exports.__esModule = true;
    var Leaderboard = (function () {
        function Leaderboard() {
        }
        Leaderboard.prototype.registerGenome = function (newGenome) {
            this.removeFromLeaderboard(newGenome);
            this.leadGenomes.push(newGenome);
            this.leadGenomes.sort(function (a, b) {
                if (a.getFitness() < b.getFitness())
                    return 1;
                if (a.getFitness() > b.getFitness())
                    return -1;
                return 0;
            });
            this.leadGenomes = this.leadGenomes.splice(0, 10);
            this.saveToLocalStorage();
            this.updateHud();
        };
        Leaderboard.prototype.removeFromLeaderboard = function (genome) {
            for (var i = 0; i < this.leadGenomes.length; i++) {
                if (this.leadGenomes[i].getId() == genome.getId()) {
                    this.leadGenomes.splice(i, 1);
                    break;
                }
            }
        };
        Leaderboard.prototype.init = function () {
            this.leadGenomes = [];
            this.loadFromLocalStorage();
            this.saveToLocalStorage();
            this.updateHud();
        };
        Leaderboard.prototype.updateHud = function () {
            var html = '<br> Leaderboard <hr> <table>';
            html += '<tr><td>Genome</td><td>Fitness</td></tr>';
            for (var i = 0; i < this.leadGenomes.length; i++) {
                html += "<tr><td>" + this.leadGenomes[i].getId() + "</td>";
                html += "<td>" + (this.leadGenomes[i].getFitness() | 0) + "</td></tr>";
            }
            html += '</table>';
            document.querySelector('#leaderboard-div').innerHTML = html;
        };
        Leaderboard.prototype.loadFromLocalStorage = function () {
            var _this = this;
            this.leadGenomes = [];
            if (localStorage.getItem('leaderboard') != null) {
                var genomesAsJsonObjects = JSON.parse(localStorage.getItem('leaderboard'));
                genomesAsJsonObjects.forEach(function (genomeJsonObj) {
                    _this.leadGenomes.push(Genome_1.Genome.fromJson(genomeJsonObj));
                });
            }
        };
        Leaderboard.prototype.saveToLocalStorage = function () {
            var genomesAsJsonObjects = [];
            this.leadGenomes.forEach(function (genome) {
                genomesAsJsonObjects.push(genome.toJson());
            });
            localStorage.setItem('leaderboard', JSON.stringify(genomesAsJsonObjects));
        };
        Leaderboard.prototype.hardReset = function () {
            localStorage.removeItem('leaderboard');
            this.init();
        };
        return Leaderboard;
    }());
    exports.Leaderboard = Leaderboard;
});
define("Learner", ["require", "exports", "Genome", "Config"], function (require, exports, Genome_2, Config_5) {
    "use strict";
    exports.__esModule = true;
    var Learner = (function () {
        function Learner(simulator, leaderboard) {
            this.simulator = simulator;
            this.genomes = [];
            this.currentGeneration = 0;
            this.leaderboard = leaderboard;
        }
        Learner.prototype.init = function () {
            if (this.hasSave()) {
                this.initFromSave();
            }
            else {
                this.initFromScratch();
            }
            this.updateHud();
        };
        Learner.prototype.hasSave = function () {
            return localStorage.getItem('learner-save') != null;
        };
        Learner.prototype.initFromSave = function () {
            this.genomes = [];
            var save = JSON.parse(localStorage.getItem('learner-save'));
            this.currentGeneration = save.currentGeneration;
            this.topFitness = save.topFitness;
            this.genomes.push(Genome_2.Genome.fromJson(save.firstPlace));
            this.genomes.push(Genome_2.Genome.fromJson(save.secondPlace));
            this.topFitness = -99999;
            this.createNextGeneration();
        };
        Learner.prototype.initFromScratch = function () {
            this.genomes = [];
            this.currentGeneration = 0;
            for (var i = 0; i < Config_5.LearnerConfig.generationSize; i++) {
                var rocket = this.simulator.addRocket();
                var genomeId = "G" + this.currentGeneration + "E" + i;
                var genome = new Genome_2.Genome(this.currentGeneration, genomeId);
                genome.init(rocket);
                this.genomes.push(genome);
            }
            this.topFitness = -99999;
        };
        Learner.prototype.update = function () {
            var _this = this;
            var genomesThatFinished = 0;
            this.genomes.forEach(function (genome) {
                genome.update();
                if (genome.didFinish()) {
                    genomesThatFinished++;
                }
            });
            if (genomesThatFinished == this.genomes.length) {
                this.genomes.forEach(function (genome) {
                    _this.leaderboard.registerGenome(genome);
                });
                this.saveGenerationResult();
                this.createNextGeneration();
            }
        };
        Learner.prototype.createNextGeneration = function () {
            var bestCandidates = this.selectBestCandidates();
            var firstPlace = bestCandidates[0];
            var secondPlace = bestCandidates[1];
            firstPlace.init(this.simulator.addRocket());
            secondPlace.init(this.simulator.addRocket());
            this.currentGeneration++;
            this.genomes = [firstPlace, secondPlace];
            for (var i = 2; i < Config_5.LearnerConfig.generationSize; i++) {
                var rocket = this.simulator.addRocket();
                var genomeId = "G" + this.currentGeneration + "E" + i;
                var genome = new Genome_2.Genome(this.currentGeneration, genomeId);
                genome.init(rocket, firstPlace, secondPlace);
                this.genomes.push(genome);
            }
            if (this.topFitness < firstPlace.getFitness()) {
                this.topFitness = firstPlace.getFitness();
            }
            this.updateHud();
        };
        Learner.prototype.updateHud = function () {
            document.querySelector('#top-fitness-label').innerHTML = "Top Fitness : <b>" + (this.topFitness | 0) + "</b>";
            document.querySelector('#generation-label').innerHTML = "Generation : <b>" + this.currentGeneration + "</b>";
        };
        Learner.prototype.selectBestCandidates = function () {
            var firstPlace = null;
            var secondPlace = null;
            this.genomes.forEach(function (crtGenome) {
                if (firstPlace == null || firstPlace.getFitness() < crtGenome.getFitness()) {
                    firstPlace = crtGenome;
                }
            });
            this.genomes.forEach(function (crtGenome) {
                if (firstPlace != crtGenome) {
                    if (secondPlace == null || secondPlace.getFitness() < crtGenome.getFitness())
                        secondPlace = crtGenome;
                }
            });
            return [firstPlace, secondPlace];
        };
        Learner.prototype.saveGenerationResult = function () {
            var bestCandidates = this.selectBestCandidates();
            var save = {
                firstPlace: bestCandidates[0].toJson(),
                secondPlace: bestCandidates[1].toJson(),
                currentGeneration: this.currentGeneration,
                topFitness: this.topFitness
            };
            localStorage.setItem('learner-save', JSON.stringify(save));
        };
        Learner.prototype.hardReset = function () {
            localStorage.removeItem('learner-save');
            this.init();
        };
        return Learner;
    }());
    exports.Learner = Learner;
});
define("Application", ["require", "exports", "Simulator", "Renderer", "Learner", "Leaderboard"], function (require, exports, Simulator_1, Renderer_1, Learner_1, Leaderboard_1) {
    "use strict";
    exports.__esModule = true;
    var Application = (function () {
        function Application() {
            var _this = this;
            this.simulator = new Simulator_1.Simulator();
            this.renderer = new Renderer_1.Renderer('#render-surface', this.simulator);
            this.leaderboard = new Leaderboard_1.Leaderboard();
            this.learner = new Learner_1.Learner(this.simulator, this.leaderboard);
            document.querySelector('#reset-button').addEventListener('click', function () { return _this.hardReset(); });
        }
        Application.prototype.init = function () {
            this.leaderboard.init();
            this.renderer.init();
            this.simulator.init();
            this.learner.init();
        };
        Application.prototype.update = function () {
            this.simulator.update();
            this.learner.update();
            this.renderer.draw();
        };
        Application.prototype.hardReset = function () {
            this.simulator.removeAllRockets();
            this.learner.hardReset();
            this.leaderboard.hardReset();
        };
        return Application;
    }());
    exports.Application = Application;
});
