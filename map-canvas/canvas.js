const INFINITY = 100000000;
const ELEVATOR_DISTANCE = 500;
const ELEVATOR_TYPE = "ELEVATOR";
const LINE_END_TYPE = "LINE_END";
const PATH_INTERSECTION_TYPE = "PATH_INTERSECTION";
const ICON_UP = "\uf062";
const ICON_DOWN = "\uf063";
let UI_MANAGER;


class Point {
    constructor(x, y, image, type, data) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.type = type;
        this.data = data;
        this.distance = INFINITY;
        this.parent = undefined;
    }

    isSimilar({x, y, image, type}) {
        return x === this.x && y === this.y && image === this.image && type === this.type;
    }

    toString() {
        return this.image + this.x + this.y + this.type;
    }
}

class Connection {
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
        this.distance = this.calculateDistance();
    }

    pointsAreSimilarElevators() {
        return this.point1.type === ELEVATOR_TYPE &&
            this.point2.type === ELEVATOR_TYPE &&
            this.point1.data.elevator === this.point2.data.elevator;
    }

    calculateEuclideanDistance() {
        return Math.sqrt(
            Math.pow(this.point1.x - this.point2.x, 2)
            + Math.pow(this.point1.y - this.point2.y, 2));
    }

    calculateDistance() {
        return this.pointsAreSimilarElevators() ? ELEVATOR_DISTANCE : this.calculateEuclideanDistance();
    }

    containsPoint(point) {
        return point === this.point1 || point === this.point2;
    }

    getTheOtherPoint(point) {
        return point === this.point1 ? this.point2 : this.point1;
    }
}

class DataParser {
    constructor(mapData) {
        this.mapData = mapData;
        this.points = this.parsePoints();
        this.connections = this.parseConnections();
    }

    static async initialize(mapData) {
        const dataParser = new DataParser(mapData);
        dataParser.images = await dataParser.parseImages();
        return dataParser;
    }

    async parseImages() {
        return Promise.all(
            this.mapData.images
                .map(imageName => this.loadImage(imageName))
        );
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = "./map/" + src;
            img.loadedName = src;
        });
    }

    parsePoints() {
        return this.mapData.imageData.map(imageDataPiece =>
            imageDataPiece.points
                .map(imageDataPiecePoint => {
                    return {
                        image: imageDataPiece.image,
                        ...imageDataPiecePoint
                    }
                }))
            .flat(1)
            .map(point => new Point(point.x, point.y, point.image, point.type, point));
    }

    parseConnections() {
        const connections = this.mapData.imageData.map(imageDataPiece =>
            imageDataPiece.connections
                .map(imageDataPieceConnection => {
                    return new Connection(
                        this.points.find(point => point
                            .isSimilar({image: imageDataPiece.image, ...imageDataPieceConnection.start})),
                        this.points.find(point => point
                            .isSimilar({image: imageDataPiece.image, ...imageDataPieceConnection.end})),
                    );
                }))
            .flat(1);
        this.points.filter(point => point.type === ELEVATOR_TYPE)
            .forEach(elevatorPoint => {
                this.points.filter(otherPoint => otherPoint.type === ELEVATOR_TYPE
                    && otherPoint !== elevatorPoint
                    && otherPoint.data.elevator === elevatorPoint.data.elevator)
                    .forEach(otherPoint => {
                        if (!connections.some(connection => connection.containsPoint(elevatorPoint)
                            && connection.containsPoint(otherPoint))) {
                            connections.push(new Connection(elevatorPoint, otherPoint));
                        }
                    });
            });
        return connections;
    }
}

class Graph {
    constructor(points, connections) {
        this.points = points;
        this.connections = connections;
    }

    findPath(point1, point2) {
        this.points.forEach(point => {
            point.distance = INFINITY;
            point.parent = undefined;
        });
        point1.distance = 0;
        const queue = [point1]

        while (queue.length > 0) {
            const current = Graph.extractMin(queue);

            this.connections
                .filter(connection => connection.containsPoint(current))
                .forEach(connection => {
                    const otherPoint = connection.getTheOtherPoint(current);
                    if (otherPoint.distance > current.distance + connection.distance) {
                        otherPoint.distance = current.distance + connection.distance;
                        otherPoint.parent = current;
                        if (!queue.includes(otherPoint)) {
                            queue.push(otherPoint);
                        }
                    }
                });
        }

        return Graph.reconstructPath(point1, point2);
    }

    static reconstructPath(point1, point2) {
        const resultPath = [];
        while (point2.parent !== point1) {
            if (point2.parent === undefined) {
                console.log("Error");
                return;
            }
            resultPath.push(point2);
            point2 = point2.parent;
        }
        resultPath.push(point2);
        resultPath.push(point1);
        return resultPath.reverse();
    }

    static extractMin(queue) {
        return queue.sort((point1, point2) => point1.distance - point2.distance).pop();
    }
}

class CanvasManager {
    constructor(images, points, canvasSize) {
        this.canvasSize = canvasSize;
        this.canvases = images.map((image, index) => {
            const wrapper = CanvasManager.createWrapper();
            const canvas = CanvasManager.createCanvas(wrapper);
            canvas.setAttribute("width", canvasSize + "px");
            canvas.setAttribute("height", canvasSize + "px");
            const canvasContext = canvas.getContext("2d");
            canvasContext.lineWidth = 2;
            canvasContext.resetCanvas = () => {
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                canvasContext.drawImage(image, 0, 0);
                this.drawCornerNumber(canvasContext, index + 1);
            }
            canvasContext.scale(canvasSize / image.width, canvasSize / image.height);
            canvasContext.resetCanvas();

            return {
                name: image.loadedName,
                wrapper,
                canvas,
                canvasContext,
            }
        });
        this.displayedIndex = 0;
        this.hideAll();
        this.changeDisplayedCanvas(0);
    }

    hideAll() {
        this.canvases.forEach(canvasData => canvasData.wrapper.style.display = "none");
    }

    changeDisplayedCanvas(index) {
        this.canvases[this.displayedIndex].wrapper.style.display = "none";
        this.displayedIndex = index;
        this.canvases[this.displayedIndex].wrapper.style.display = "block";
    }

    displayNext() {
        if (this.displayedIndex + 1 < this.canvases.length) {
            this.changeDisplayedCanvas(this.displayedIndex + 1);
        }
    }

    displayPrevious() {
        if (this.displayedIndex - 1 >= 0) {
            this.changeDisplayedCanvas(this.displayedIndex - 1);
        }
    }

    static createWrapper() {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "map-wrapper");
        document.body.appendChild(wrapper);
        return wrapper;
    }

    static createCanvas(wrapper) {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("class", "map-canvas");
        wrapper.appendChild(canvas);
        return canvas;
    }

    clearCanvases() {
        this.canvases.forEach(({canvasContext}) => canvasContext.resetCanvas());
    }

    drawPointOfInterest(canvasContext, x, y, radius, color) {
        canvasContext.beginPath();
        canvasContext.fillStyle = color;
        canvasContext.arc(x, y, radius, 0, 2 * Math.PI, false);
        canvasContext.fill();
        canvasContext.stroke();
        canvasContext.strokeStyle = 'black';
        canvasContext.fillStyle = 'black';
    }

    drawCornerNumber(canvasContext, number) {
        canvasContext.font = '40px Arial';
        canvasContext.fillText(number.toString(), 15, 15 + 40);
    }

    drawCornerIcon(canvasContext, color, icon) {
        canvasContext.font = '40px FontAwesome';
        canvasContext.fillStyle = color;
        canvasContext.fillText(icon, 40, 15 + 40);
        canvasContext.fillStyle = "black";
    }

    displayPath(pointArray) {
        this.clearCanvases();

        const startCanvasData = this.canvases
            .filter(({name}) => name === pointArray[0].image)[0];
        const startContext = startCanvasData.canvasContext;
        const startIndex = this.canvases.indexOf(startCanvasData);
        this.changeDisplayedCanvas(startIndex);

        this.drawPointOfInterest(startContext, pointArray[0].x, pointArray[0].y, 10, "green");

        for (let i = 0; i < pointArray.length - 1; i++) {
            const point1 = pointArray[i];
            const point2 = pointArray[i + 1];
            if (point1.image === point2.image) {
                const context = this.canvases.filter(({name}) => name === point1.image)[0].canvasContext;
                context.moveTo(point1.x, point1.y);
                context.lineTo(point2.x, point2.y);
                context.stroke();
            } else {
                const firstCanvasData = this.canvases.filter(({name}) => name === point1.image)[0];
                const firstIndex = this.canvases.indexOf(firstCanvasData);
                const lastCanvasData = this.canvases.filter(({name}) => name === point2.image)[0];
                const lastIndex = this.canvases.indexOf(lastCanvasData);

                if (firstIndex < lastIndex) {
                    for (let i = firstIndex; i < lastIndex; i++) {
                        this.drawCornerIcon(this.canvases[i].canvasContext, "darkblue", ICON_UP);
                    }
                } else {
                    for (let i = firstIndex; i > lastIndex; i--) {
                        this.drawCornerIcon(this.canvases[i].canvasContext, "darkblue", ICON_DOWN);
                    }
                }


                this.drawPointOfInterest(firstCanvasData.canvasContext,
                    point1.x, point1.y, 10, "lightblue");
                this.drawPointOfInterest(lastCanvasData.canvasContext,
                    point2.x, point2.y, 10, "darkblue");
            }
        }

        const endContext = this.canvases
            .filter(({name}) => name === pointArray[pointArray.length - 1].image)[0].canvasContext;
        this.drawPointOfInterest(endContext,
            pointArray[pointArray.length - 1].x, pointArray[pointArray.length - 1].y, 10, "darkred");
    }
}

class UIManager {
    constructor(points, connections, images) {
        this.graph = new Graph(points, connections);
        this.canvasManager = new CanvasManager(images, points, window.innerWidth);
        this.points = points;
    }

    drawPath(point1, point2) {
        const actualPoint1 = this.findActualPoint(point1);
        const actualPoint2 = this.findActualPoint(point2);
        this.canvasManager.displayPath(this.graph.findPath(actualPoint1, actualPoint2));
    }

    findActualPoint({x, y, image}) {
        return this.points.filter(point => point.x === x && point.y === y && point.image === image)[0];
    }

    moveUp() {
        this.canvasManager.displayNext();
    }

    moveDown() {
        this.canvasManager.displayPrevious();
    }

    getJsonPoints() {
        return JSON.stringify(this.points);
    }
}

window.onload = () => {
    fetch('./map/labels.json')
        .then(response => response.json())
        .then(data => DataParser.initialize(data))
        .then(({points, connections, images}) => {
            UI_MANAGER = new UIManager(points, connections, images);
            /*

            const p1 = points[10];
            const p2 = points[99];

            UI_MANAGER.drawPath(p1, p2);

             */
        })
        .catch(error => console.log(error));
}

const drawPath = (point1, point2) => {
    UI_MANAGER.drawPath(point1, point2);
}

const moveUp = () => {
    UI_MANAGER.moveUp();
}

const moveDown = () => {
    UI_MANAGER.moveDown();
}

const getJsonPoints = () => {
    window.ReactNativeWebView.postMessage(UI_MANAGER.getJsonPoints());
}