// @ts-nocheck
import {PointLabelsExporter} from './PointLabelsExport';
import {LineLabelsExporter} from './LineLabelExport';
import {PolygonLabelsExporter} from './polygon/PolygonLabelsExporter';
import {distance, Line, lineIntersect, Point, pointLineClosestPoint, Polygon, polygonToLines} from './AnalyticGeometry';
import _ from 'lodash';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {ExporterUtil} from '../../utils/ExporterUtil';

export class MapDataExporter {
    public static exportMap() {
        const pointData: Point[] = PointLabelsExporter.exportData();
        const lineData: Line[] = LineLabelsExporter.exportData();
        const polygonData: Polygon[] = PolygonLabelsExporter.exportData();
        const mapData = {
            images: LabelsSelector.getImagesData().map(imageData => imageData.fileData.name),
            imageData: MapDataExporter.detectLinePoints(pointData, lineData, polygonData)
        };
        const content: string = JSON.stringify(mapData);
        const fileName: string = `${ExporterUtil.getExportFileName()}.json`;
        ExporterUtil.saveAs(content, fileName);
    }

    private static detectLinePoints(pointData: Point[], lineData: Line[], polygonData: Polygon[]) {
        const parsedData = lineData.map(mainLine => {
            const lineConnections = lineData
                .filter(subLine => mainLine.image === subLine.image && mainLine.id !== subLine.id)
                .filter(subLine => lineIntersect(mainLine, subLine) !== false)
                .map(subLine => {
                    return {
                        ...lineIntersect(mainLine, subLine),
                        type: 'PATH_INTERSECTION',
                        path1: mainLine.label,
                        path2: subLine.label
                    }
                });
            const polygonConnections = polygonData
                .map(polygonToLines)
                .flat(1)
                .filter(polygonLine => mainLine.image === polygonLine.image)
                .filter(polygonLine => lineIntersect(mainLine, polygonLine) !== false)
                .map(polygonLine => {
                    return {
                        ...lineIntersect(mainLine, polygonLine),
                        type: 'ROOM_ENTRY',
                        path: mainLine.label,
                        room: polygonLine.label
                    }
                });
            const additionalPoints = pointData
                .filter(point => mainLine.image === point.image)
                .filter(point => lineData
                    .filter(subLine => mainLine.image === subLine.image)
                    .sort((firstEl, secondEl) => {
                        const firstElPointLine = pointLineClosestPoint(point, firstEl);
                        const secondElPointLine = pointLineClosestPoint(point, secondEl);
                        return distance(point.x, point.y, firstElPointLine.x, firstElPointLine.y)
                            - distance(point.x, point.y, secondElPointLine.x, secondElPointLine.y);
                    })[0].id === mainLine.id)
                .map(point => {
                    return {
                        ...pointLineClosestPoint(point, mainLine),
                        type: 'ELEVATOR',
                        path: mainLine.label,
                        elevator: point.label
                    };
                })
            const points = lineConnections
                .concat(polygonConnections, additionalPoints, [
                    {
                        x: mainLine.x1,
                        y: mainLine.y1,
                        type: 'LINE_END'
                    },
                    {
                        x: mainLine.x2,
                        y: mainLine.y2,
                        type: 'LINE_END'
                    }
                ])
                .map(point => ({
                    ...point,
                    x: Math.round(point.x),
                    y: Math.round(point.y)
                }))
                .sort((point1, point2) => {
                    if (point1.x === point2.x) {
                        return point1.y - point2.y;
                    }
                    return point1.x - point2.x;
                });
            const connections = _.zip(points.slice(0, -1), points.slice(1))
                .map(([point1, point2]) => {
                    return {
                        start: point1,
                        end: point2
                    }
                })
            return {
                image: mainLine.image,
                points,
                connections
            };
        });
        return [...new Set(
            parsedData
                .map(dataPiece => dataPiece.image)
        )]
            .map(image => {
                const imagePoints = parsedData
                    .filter(dataPiece => dataPiece.image === image)
                    .map(dataPiece => dataPiece.points)
                    .flat(1)
                const connections = parsedData
                    .filter(dataPiece => dataPiece.image === image)
                    .map(dataPiece => dataPiece.connections)
                    .flat(1);
                return {
                    image,
                    points: _.uniqWith(imagePoints,
                        (first, second) => first.x === second.x
                            && first.y === second.y && first.type === second.type),
                    connections
                }
            })
    }
}