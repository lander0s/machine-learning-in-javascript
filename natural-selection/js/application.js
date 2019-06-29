define("Config", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.SimulatorConfig = {
        terrainSizeInMts: 100
    };
});
define("Simulator", ["require", "exports", "Config"], function (require, exports, Config_1) {
    "use strict";
    exports.__esModule = true;
    var Simulator = (function () {
        function Simulator() {
            this.generateTerrain();
        }
        Simulator.prototype.generateTerrain = function () {
            noise.seed(Math.random());
            this.terrain = [];
            for (var x = 0; x < Config_1.SimulatorConfig.terrainSizeInMts; x++) {
                this.terrain[x] = [];
                for (var y = 0; y < Config_1.SimulatorConfig.terrainSizeInMts; y++) {
                    var dx = x - Config_1.SimulatorConfig.terrainSizeInMts / 2;
                    var dy = y - Config_1.SimulatorConfig.terrainSizeInMts / 2;
                    var distanceToCenter = Math.sqrt(dx * dx + dy * dy);
                    var n = (noise.perlin2(x / 10, y / 10) + 1) / 2;
                    n *= 1.0 - (distanceToCenter / (Config_1.SimulatorConfig.terrainSizeInMts / 2));
                    this.terrain[x][y] = n;
                }
            }
        };
        Simulator.prototype.getTerrain = function () {
            return this.terrain;
        };
        Simulator.prototype.update = function () {
        };
        return Simulator;
    }());
    exports.Simulator = Simulator;
});
define("Renderer", ["require", "exports", "Config"], function (require, exports, Config_2) {
    "use strict";
    exports.__esModule = true;
    var Renderer = (function () {
        function Renderer(simulator) {
            this.mScale = 10.0;
            this.mCameraPos = [0, 0];
            this.mSimulator = simulator;
            this.mCanvas = document.querySelector('#main-canvas');
            this.onResize();
        }
        Renderer.prototype.onResize = function () {
            this.mCanvas.width = window.innerWidth;
            this.mCanvas.height = window.innerHeight;
            this.mContext = this.mCanvas.getContext('2d');
        };
        Renderer.prototype.draw = function () {
            this.mContext.clearRect(0, 0, this.mCanvas.width, this.mCanvas.height);
            this.mContext.save();
            this.mContext.translate(this.mCanvas.width / 2, this.mCanvas.height / 2);
            this.mContext.scale(1, -1);
            this.mContext.translate(-this.mCameraPos[0], -this.mCameraPos[1]);
            this.drawTerrain();
            this.mContext.restore();
        };
        Renderer.prototype.drawTerrain = function () {
            this.mContext.save();
            var terrain = this.mSimulator.getTerrain();
            var terrainSizeInPixels = Config_2.SimulatorConfig.terrainSizeInMts * this.mScale;
            var halfTerrainSizeInPixels = terrainSizeInPixels / 2;
            this.mContext.strokeStyle = 'white';
            this.mContext.translate(-halfTerrainSizeInPixels, -halfTerrainSizeInPixels);
            for (var x = 0; x < Config_2.SimulatorConfig.terrainSizeInMts; x++) {
                for (var y = 0; y < Config_2.SimulatorConfig.terrainSizeInMts; y++) {
                    var idx = y * Config_2.SimulatorConfig.terrainSizeInMts + x;
                    var val = terrain[x][y] * 255;
                    this.mContext.fillStyle = "rgba(" + val + "," + val + "," + val + ")";
                    var xPixels = (x * this.mScale) - (this.mScale / 2);
                    var yPixels = (y * this.mScale) - (this.mScale / 2);
                    this.mContext.fillRect(xPixels, yPixels, this.mScale, this.mScale);
                }
            }
            this.mContext.restore();
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
        }
        Application.prototype.main = function () {
            this.mSimulator = new Simulator_1.Simulator();
            this.mRenderer = new Renderer_1.Renderer(this.mSimulator);
        };
        Application.prototype.update = function () {
            this.mSimulator.update();
            this.mRenderer.draw();
        };
        return Application;
    }());
    exports.Application = Application;
});
