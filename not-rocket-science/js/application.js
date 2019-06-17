define("Config", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.SimulatorConfig = {
        rocketSpawnPoint: [0, 40],
        rocketSize: [1, 8],
        thrusterFreedomInDegrees: 90,
        thrusterMaxIntensity: 20,
        fuelTankCapacity: 5 * 60,
        fuelConsumptionRate: 1,
        secondsToRemoveDeadRockets: 0
    };
    exports.RenderConfig = {
        initialCameraPosition: [0, 20]
    };
    exports.LearnerConfig = {
        generationSize: 12
    };
});
define("Rocket", ["require", "exports", "Config"], function (require, exports, Config_1) {
    "use strict";
    exports.__esModule = true;
    var Rocket = (function () {
        function Rocket(body) {
            this.isAlive = true;
            this.score = 0;
            this.body = body;
            this.thrusterAngle = 0;
            this.desiredThrusterAngle = 0;
            this.thrusterIntensity = 0;
            this.desiredThrusterIntensity = 0;
            this.fuelTankReserve = Config_1.SimulatorConfig.fuelTankCapacity;
        }
        Rocket.prototype.update = function (elapsedSeconds) {
            var thrusterRotationSpeed = 5;
            var thrusterIntensityAcc = 50;
            this.thrusterAngle = this.stepValue(this.desiredThrusterAngle, this.thrusterAngle, thrusterRotationSpeed, elapsedSeconds);
            this.thrusterIntensity = this.stepValue(this.desiredThrusterIntensity, this.thrusterIntensity, thrusterIntensityAcc, elapsedSeconds);
            this.thrusterIntensity *= this.getEngineEfficiency();
            this.consumeFuel();
        };
        Rocket.prototype.setScore = function (value) {
            this.score = value;
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
        Rocket.prototype.getFuelTankReservePercentage = function () {
            return this.fuelTankReserve / Config_1.SimulatorConfig.fuelTankCapacity;
        };
        Rocket.prototype.consumeFuel = function () {
            var fuelConsumption = this.getThrusterIntensityFactor() * Config_1.SimulatorConfig.fuelConsumptionRate;
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
            this.removeDeadRockets();
        };
        Simulator.prototype.applyRandomImpulse = function (rocket) {
            var forceX = (Math.random() * 2 - 1) * 20;
            var forceY = (Math.random() * 2 - 1) * 20;
            var posX = (Math.random() * 2 + 1) * Config_2.SimulatorConfig.rocketSize[0];
            var posY = 0;
            rocket.getPhysicsObject().applyImpulseLocal([forceX, forceY], [posX, posY]);
        };
        Simulator.prototype.onBeginContact = function (evt) {
            var theRocket = evt.bodyA.id == this.ground.id ? evt.bodyB : evt.bodyA;
            var rocket = this.getRocketById(theRocket.id);
            if (!rocket.isDead()) {
                var score = this.judgeLanding(rocket.getPhysicsObject());
                rocket.setScore(score);
            }
            rocket.markAsDead();
        };
        Simulator.prototype.judgeLanding = function (obj) {
            var spinWeight = 1600;
            var spinRatio = 600;
            var spinScore = spinWeight - Math.abs(obj.angularVelocity) * spinRatio;
            var angularWeight = 800;
            var angularRatio = 2000;
            var angularScore = angularWeight - Math.abs(obj.angle) * angularRatio;
            var speedWeight = 400;
            var speedRatio = 10;
            var speed = Math.sqrt(obj.velocity[0] * obj.velocity[0] +
                obj.velocity[1] * obj.velocity[1]);
            var speedScore = speedWeight - speed * speedRatio;
            return spinScore + angularScore + speedScore;
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
        Simulator.prototype.removeDeadRockets = function () {
            for (var i = this.rockets.length - 1; i >= 0; i--) {
                if (this.rockets[i].isDead() && this.rockets[i].getSecondsSinceDeath() >= Config_2.SimulatorConfig.secondsToRemoveDeadRockets) {
                    var rocket = this.rockets[i];
                    this.world.removeBody(rocket.getPhysicsObject());
                    this.rockets.splice(i, 1);
                }
            }
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
            this.canvas.style.backgroundColor = '#1b2124';
            this.cameraPosition = Config_3.RenderConfig.initialCameraPosition;
            this.fireGFX = new FireGFX_1.FireGFX(this.canvas, this.context);
            window.addEventListener('wheel', function (e) { return _this.onMouseWheel(e); });
            this.scale = 20;
            this.rocketTexture = new Image();
            this.rocketTexture.src = './res/rocket-texture.png';
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
            this.context.lineWidth = 0.4 * this.scale;
            this.drawGround();
            this.drawRockets();
            this.context.restore();
        };
        Renderer.prototype.drawRockets = function () {
            var rockets = this.simulator.getAllRockets();
            for (var i = 0; i < rockets.length; i++) {
                var rocket = rockets[i];
                this.context.save();
                this.context.globalAlpha *= (i == 0 ? 1.0 : 0.05);
                var screenSpacePosition = this.toScreenSpace(rocket.getPosition());
                this.context.translate(screenSpacePosition[0], screenSpacePosition[1]);
                this.context.rotate(rocket.getAngle());
                var rocketSize = this.toScreenSpace(Config_3.SimulatorConfig.rocketSize);
                this.context.drawImage(this.rocketTexture, -rocketSize[0] / 2, -rocketSize[1] / 2, rocketSize[0], rocketSize[1]);
                this.context.translate(0, -rocketSize[1] / 2);
                this.context.rotate(rocket.getThrusterAngle());
                this.fireGFX.draw(rocket.getThrusterIntensityFactor(), this.toScreenSpace(Config_3.SimulatorConfig.rocketSize));
                this.context.restore();
            }
            this.fireGFX.update();
        };
        Renderer.prototype.drawGround = function () {
            this.context.beginPath();
            this.context.moveTo(-this.canvas.width * 100, 0);
            this.context.lineTo(this.canvas.width * 100, 0);
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
define("Genome", ["require", "exports", "Config"], function (require, exports, Config_4) {
    "use strict";
    exports.__esModule = true;
    var Genome = (function () {
        function Genome(generation, uuid, rocket) {
            this.generation = 0;
            this.network = null;
            this.rocket = null;
            this.generation = generation;
            this.uuid = uuid;
            this.rocket = rocket;
        }
        Genome.prototype.update = function () {
            var angularVelocityClamp = 30;
            var isRotatingClockWise = this.rocket.getAngularVelocity() < 0;
            var isTiltedToRight = this.rocket.getAngle() < 0;
            var absAngularVelocity = Math.min(Math.abs(this.rocket.getAngularVelocity()), angularVelocityClamp);
            var absAngle = Math.abs(this.rocket.getAngle());
            var input = [
                isRotatingClockWise ? 1.0 : 0.0,
                isTiltedToRight ? 1.0 : 0.0,
                absAngularVelocity / angularVelocityClamp,
                absAngle / Math.PI
            ];
            var output = this.network.activate(input);
            this.rocket.setDesiredThrusterAngleFactor(output[0]);
            this.rocket.setDesiredThrusterIntensityFactor(output[1]);
        };
        Genome.prototype.didFinish = function () {
            return this.rocket.isDead() && this.rocket.getSecondsSinceDeath() >= Config_4.SimulatorConfig.secondsToRemoveDeadRockets;
        };
        Genome.prototype.createNeuralNetworkFromScratch = function () {
            this.network = new synaptic.Architect.Perceptron(4, 4, 4, 2);
        };
        Genome.prototype.fromParents = function (daddy, mum) {
            var daddyNetworkJsonObj = JSON.parse(JSON.stringify(daddy.network.toJSON()));
            var mumNetworkJsonObj = JSON.parse(JSON.stringify(mum.network.toJSON()));
            var childNetworkJsonObj = this.crossOver(daddyNetworkJsonObj, mumNetworkJsonObj);
            var mutatedNetworkJsonObj = this.mutate(childNetworkJsonObj);
            this.network = synaptic.Network.fromJSON(mutatedNetworkJsonObj);
        };
        Genome.prototype.getFitness = function () {
            return this.rocket.getScore();
        };
        Genome.prototype.getGeneration = function () {
            return this.generation;
        };
        Genome.prototype.getUUID = function () {
            return this.uuid;
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
        return Genome;
    }());
    exports.Genome = Genome;
});
define("Learner", ["require", "exports", "Genome", "Config"], function (require, exports, Genome_1, Config_5) {
    "use strict";
    exports.__esModule = true;
    var Learner = (function () {
        function Learner(simulator) {
            this.simulator = simulator;
            this.genomes = [];
            this.currentGeneration = 0;
        }
        Learner.prototype.init = function () {
            this.genomes = [];
            for (var i = 0; i < Config_5.LearnerConfig.generationSize; i++) {
                var rocket = this.simulator.addRocket();
                var genomeId = this.currentGeneration + "." + i;
                var genome = new Genome_1.Genome(this.currentGeneration, genomeId, rocket);
                genome.createNeuralNetworkFromScratch();
                this.genomes.push(genome);
            }
        };
        Learner.prototype.update = function () {
            var genomesThatFinished = 0;
            this.genomes.forEach(function (genome) {
                genome.update();
                if (genome.didFinish()) {
                    genomesThatFinished++;
                }
            });
            if (genomesThatFinished == this.genomes.length) {
                this.createNextGeneration();
            }
        };
        Learner.prototype.createNextGeneration = function () {
            var firstPlace = this.getAndRemoveBestCandidate();
            var secondPlace = this.getAndRemoveBestCandidate();
            this.currentGeneration++;
            this.genomes = [firstPlace, secondPlace];
            for (var i = 2; i < Config_5.LearnerConfig.generationSize; i++) {
                var rocket = this.simulator.addRocket();
                var genomeId = this.currentGeneration + "." + i;
                var genome = new Genome_1.Genome(this.currentGeneration, genomeId, rocket);
                genome.fromParents(firstPlace, secondPlace);
                this.genomes.push(genome);
            }
        };
        Learner.prototype.getAndRemoveBestCandidate = function () {
            var bestCandidateIndex = 0;
            var bestCandidate = this.genomes[bestCandidateIndex];
            for (var i = 0; i < this.genomes.length; i++) {
                var crtGenome = this.genomes[i];
                if (bestCandidate.getFitness() < crtGenome.getFitness()) {
                    bestCandidateIndex = i;
                    bestCandidate = crtGenome;
                }
            }
            this.genomes.splice(bestCandidateIndex, 1);
            return bestCandidate;
        };
        return Learner;
    }());
    exports.Learner = Learner;
});
define("Application", ["require", "exports", "Simulator", "Renderer", "Learner"], function (require, exports, Simulator_1, Renderer_1, Learner_1) {
    "use strict";
    exports.__esModule = true;
    var Application = (function () {
        function Application() {
            this.simulator = new Simulator_1.Simulator();
            this.renderer = new Renderer_1.Renderer('#render-surface', this.simulator);
            this.learner = new Learner_1.Learner(this.simulator);
        }
        Application.prototype.init = function () {
            this.renderer.init();
            this.simulator.init();
            this.learner.init();
            var rocket = this.simulator.addRocket();
            rocket.setDesiredThrusterIntensityFactor(0.0);
            rocket.setDesiredThrusterAngleFactor(0.5);
            setTimeout(function () {
                rocket.setDesiredThrusterIntensityFactor(1.0);
            }, 1500);
        };
        Application.prototype.update = function () {
            this.simulator.update();
            this.learner.update();
            this.renderer.draw();
        };
        return Application;
    }());
    exports.Application = Application;
});
