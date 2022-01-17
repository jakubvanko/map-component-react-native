import _ from 'lodash';

export interface Point {
    id: string,
    image: string,
    label: string,
    type: string,
    x: number,
    y: number,
}

export interface Line {
    id: string,
    image: string,
    label: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

export interface Polygon {
    id: string,
    label: string,
    image: string,
    points: {
        x: number,
        y: number
    }[]
}


// Line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
export const lineIntersect = (first: Line, second: Line): (boolean | { x: number, y: number }) => {
    const x1 = first.x1;
    const y1 = first.y1;
    const x2 = first.x2;
    const y2 = first.y2;

    const x3 = second.x1;
    const y3 = second.y1;
    const x4 = second.x2;
    const y4 = second.y2;

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false;
    }

    const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    // Lines are parallel
    if (denominator === 0) {
        return false;
    }

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false;
    }

    // Return a object with the x and y coordinates of the intersection
    const x = x1 + ua * (x2 - x1);
    const y = y1 + ua * (y2 - y1);

    return {x, y};
}

export const pointLineClosestPoint = (point: Point, line: Line): { x: number, y: number } => {
    const xDelta = line.x2 - line.x1;
    const yDelta = line.y2 - line.y1;

    if ((xDelta === 0) && (yDelta === 0)) {
        return {x: line.x1, y: line.y1};
    }

    const u = ((point.x - line.x1) * xDelta + (point.y - line.y1) * yDelta) / (xDelta * xDelta + yDelta * yDelta);

    if (u < 0) {
        return {x: line.x1, y: line.y1};
    } else if (u > 1) {
        return {x: line.x2, y: line.y2};
    }
    return {
        x: line.x1 + u * xDelta,
        y: line.y1 + u * yDelta
    };
}

export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export const polygonToLines = (polygon: Polygon): Line[] => {
    return _.zip(polygon.points.slice(0, -1), polygon.points.slice(1))
        .map(([point1, point2]) => {
            return {
                id: polygon.id,
                image: polygon.image,
                label: polygon.label,
                x1: point1.x,
                y1: point1.y,
                x2: point2.x,
                y2: point2.y
            };
        });
}