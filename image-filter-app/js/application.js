var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
define("DragImageElement", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var DragImageElement = (function () {
        function DragImageElement(selector, text) {
            var _this = this;
            if (text === void 0) { text = 'Drag an image here or click for browsing'; }
            this.selector = selector;
            this.rootElem = document.querySelector(selector);
            this.rootElem.innerHTML = text;
            this.rootElem.className = 'drag-image-element';
            this.rootElem.addEventListener('mouseover', function (e) { return _this.onMouseOver(); });
            this.rootElem.addEventListener('mouseleave', function (e) { return _this.onMouseLeave(); });
            this.rootElem.addEventListener('click', function (e) { return _this.onClick(); });
            this.rootElem.addEventListener('dragover', function (e) { return e.preventDefault(); });
            this.rootElem.addEventListener('drop', function (e) { return _this.onDrop(e); });
            this.onload = function () { };
            this.resetInputFile();
        }
        DragImageElement.prototype.resetInputFile = function () {
            var _this = this;
            this.inputFile = document.createElement('input');
            this.inputFile.type = 'file';
            this.inputFile.addEventListener('change', function (e) { return _this.onImageSelected(e); });
        };
        DragImageElement.prototype.hideHintText = function () {
            this.rootElem.style.color = 'rgba(0,0,0,0)';
        };
        DragImageElement.prototype.onMouseOver = function () {
            this.rootElem.style.textDecoration = 'underline';
        };
        DragImageElement.prototype.onMouseLeave = function () {
            this.rootElem.style.textDecoration = 'none';
        };
        DragImageElement.prototype.onClick = function () {
            this.inputFile.click();
        };
        DragImageElement.prototype.onImageSelected = function (event) {
            var _this = this;
            var selectedFile = event.target.files[0];
            if (selectedFile.type.match('image.*')) {
                var reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onload = function (loadedEvent) {
                    if (loadedEvent.target.readyState == FileReader.DONE) {
                        _this.onImageReadAsDataUrl(loadedEvent.target.result);
                    }
                };
            }
            else {
                console.error('The selected file is not an image');
            }
        };
        DragImageElement.prototype.onImageReadAsDataUrl = function (url) {
            var _this = this;
            this.rootElem.style.backgroundImage = "url(" + url + ")";
            this.rootElem.style.border = '5px solid gray';
            this.resetInputFile();
            this.hideHintText();
            var image = new Image();
            image.src = url;
            image.onload = function () { return _this.onload(image); };
        };
        DragImageElement.prototype.onDrop = function (event) {
            var _this = this;
            event.preventDefault();
            if (event.dataTransfer.items) {
                var item = event.dataTransfer.items[0];
                if (item.kind === 'file') {
                    var selectedFile = item.getAsFile();
                    var reader = new FileReader();
                    reader.readAsDataURL(selectedFile);
                    reader.onload = function (loadedEvent) {
                        if (loadedEvent.target.readyState == FileReader.DONE) {
                            _this.onImageReadAsDataUrl(loadedEvent.target.result);
                        }
                    };
                }
                else {
                    console.error('Selected item is not a file');
                }
            }
        };
        return DragImageElement;
    }());
    exports.DragImageElement = DragImageElement;
});
define("Pixel", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Pixel = (function () {
        function Pixel(rgba) {
            this.r = rgba[0];
            this.g = rgba[1];
            this.b = rgba[2];
            this.a = rgba[3];
        }
        return Pixel;
    }());
    exports.Pixel = Pixel;
});
define("RawImage", ["require", "exports", "Pixel"], function (require, exports, Pixel_1) {
    "use strict";
    exports.__esModule = true;
    var RawImage = (function () {
        function RawImage() {
            this.pixels = [];
            this.width = 0;
            this.height = 0;
            this.canvas = document.createElement('canvas');
            this.updateCanvasContext();
        }
        RawImage.prototype.updateCanvasContext = function () {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.context = this.canvas.getContext('2d');
        };
        RawImage.prototype.copyFrom = function (image) {
            this.width = image.width;
            this.height = image.height;
            this.pixels = [];
            for (var i = 0; i < image.pixels.length; i++) {
                var pixel = __assign({}, image.pixels[i]);
                this.pixels.push(pixel);
            }
            this.updateCanvasContext();
        };
        RawImage.prototype.fromImage = function (image) {
            this.width = image.width;
            this.height = image.height;
            this.updateCanvasContext();
            this.context.drawImage(image, 0, 0, this.width, this.height);
            var imageData = this.context.getImageData(0, 0, this.width, this.height);
            this.pixels = [];
            for (var j = 0; j < this.height; j++) {
                for (var i = 0; i < this.width; i++) {
                    var rgba = [];
                    var pixelIndex = (j * this.width + i) * 4;
                    rgba[0] = imageData.data[pixelIndex + 0];
                    rgba[1] = imageData.data[pixelIndex + 1];
                    rgba[2] = imageData.data[pixelIndex + 2];
                    rgba[3] = imageData.data[pixelIndex + 3];
                    var pixel = new Pixel_1.Pixel(rgba);
                    this.pixels.push(pixel);
                }
            }
        };
        RawImage.prototype.invertColors = function () {
            for (var i = 0; i < this.pixels.length; i++) {
                this.pixels[i].r = 255 - this.pixels[i].r;
                this.pixels[i].g = 255 - this.pixels[i].g;
                this.pixels[i].b = 255 - this.pixels[i].b;
            }
        };
        RawImage.prototype.toDataUrl = function () {
            var imageData = this.context.getImageData(0, 0, this.width, this.height);
            for (var i = 0; i < this.pixels.length; i++) {
                var pixelOffset = i * 4;
                imageData.data[pixelOffset + 0] = this.pixels[i].r;
                imageData.data[pixelOffset + 1] = this.pixels[i].g;
                imageData.data[pixelOffset + 2] = this.pixels[i].b;
                imageData.data[pixelOffset + 3] = this.pixels[i].a;
            }
            this.context.putImageData(imageData, 0, 0);
            return this.canvas.toDataURL();
        };
        return RawImage;
    }());
    exports.RawImage = RawImage;
});
define("ImageFilterLearner", ["require", "exports", "RawImage"], function (require, exports, RawImage_1) {
    "use strict";
    exports.__esModule = true;
    var ImageFilterLearner = (function () {
        function ImageFilterLearner() {
            this.network = new synaptic.Architect.Perceptron(3, 3, 3);
            this.learningRate = 0.5;
        }
        ImageFilterLearner.prototype.train = function (original, filtered) {
            for (var y = 0; y < original.height; y++) {
                for (var x = 0; x < original.width; x++) {
                    var pixelIndex = y * original.width + x;
                    this.network.activate([
                        original.pixels[pixelIndex].r / 255.0,
                        original.pixels[pixelIndex].g / 255.0,
                        original.pixels[pixelIndex].b / 255.0,
                    ]);
                    this.network.propagate(this.learningRate, [
                        filtered.pixels[pixelIndex].r / 255.0,
                        filtered.pixels[pixelIndex].g / 255.0,
                        filtered.pixels[pixelIndex].b / 255.0,
                    ]);
                }
            }
        };
        ImageFilterLearner.prototype.applyFilter = function (image) {
            var newImage = new RawImage_1.RawImage();
            newImage.copyFrom(image);
            for (var i = 0; i < newImage.pixels.length; i++) {
                var output = this.network.activate([
                    image.pixels[i].r / 255.0,
                    image.pixels[i].g / 255.0,
                    image.pixels[i].b / 255.0,
                ]);
                newImage.pixels[i].r = output[0] * 255 | 0;
                newImage.pixels[i].g = output[1] * 255 | 0;
                newImage.pixels[i].b = output[2] * 255 | 0;
            }
            return newImage;
        };
        return ImageFilterLearner;
    }());
    exports.ImageFilterLearner = ImageFilterLearner;
});
define("Application", ["require", "exports", "DragImageElement", "RawImage", "ImageFilterLearner"], function (require, exports, DragImageElement_1, RawImage_2, ImageFilterLearner_1) {
    "use strict";
    exports.__esModule = true;
    var ImageRol;
    (function (ImageRol) {
        ImageRol[ImageRol["Example"] = 0] = "Example";
        ImageRol[ImageRol["Filtered"] = 1] = "Filtered";
        ImageRol[ImageRol["Challenge"] = 2] = "Challenge";
    })(ImageRol || (ImageRol = {}));
    var Application = (function () {
        function Application() {
            this.exampleRawImage = null;
            this.filterRawImage = null;
            this.challengeRawImage = null;
        }
        Application.prototype.main = function () {
            var _this = this;
            this.imageFilterLearner = new ImageFilterLearner_1.ImageFilterLearner();
            this.exampleDragImage = new DragImageElement_1.DragImageElement('#example-image', 'original image goes here');
            this.filterDragImage = new DragImageElement_1.DragImageElement('#example-image-with-filter', 'filtered image goes here');
            this.challengeDragImage = new DragImageElement_1.DragImageElement('#challenge-image', 'a complete different image goes here');
            this.exampleDragImage.onload = function (args) { return _this.onImageLoaded(args, ImageRol.Example); };
            this.filterDragImage.onload = function (args) { return _this.onImageLoaded(args, ImageRol.Filtered); };
            this.challengeDragImage.onload = function (args) { return _this.onImageLoaded(args, ImageRol.Challenge); };
        };
        Application.prototype.onImageLoaded = function (img, rol) {
            switch (rol) {
                case ImageRol.Example: {
                    this.exampleRawImage = new RawImage_2.RawImage();
                    this.exampleRawImage.fromImage(img);
                    break;
                }
                case ImageRol.Filtered: {
                    this.filterRawImage = new RawImage_2.RawImage();
                    this.filterRawImage.fromImage(img);
                    break;
                }
                case ImageRol.Challenge: {
                    this.challengeRawImage = new RawImage_2.RawImage();
                    this.challengeRawImage.fromImage(img);
                    break;
                }
            }
            if (this.isReady()) {
                this.imageFilterLearner.train(this.exampleRawImage, this.filterRawImage);
                var resultImage = this.imageFilterLearner.applyFilter(this.challengeRawImage);
                var imageAsUrl = resultImage.toDataUrl();
                var resultElem = document.querySelector('#ann-result');
                resultElem.style.backgroundImage = "url(" + imageAsUrl + ")";
                resultElem.style.backgroundSize = '100% 100%';
                resultElem.className += " ann-revealed-result";
            }
        };
        Application.prototype.isReady = function () {
            return this.exampleRawImage
                && this.filterRawImage
                && this.challengeRawImage;
        };
        return Application;
    }());
    exports.Application = Application;
});
