import {AnnotationFormatType} from "../../../data/enums/AnnotationFormatType";
import {VGGExporter} from "./VGGExporter";
import {COCOExporter} from "./COCOExporter";
import _ from "lodash";
import {Polygon} from '../AnalyticGeometry';
import {v4} from 'uuid';

export class PolygonLabelsExporter {
    public static export(exportFormatType: AnnotationFormatType): void {
        switch (exportFormatType) {
            case AnnotationFormatType.VGG:
                VGGExporter.export();
                break;
            case AnnotationFormatType.COCO:
                COCOExporter.export();
                break;
            default:
                return;
        }
    }

    public static exportData(): Polygon[] {
        return Object.entries(VGGExporter.exportData())
            .map(([image, data]) => {
                return Object.entries(data.regions)
                    .map(([x, regionData]) => {
                        // @ts-ignore
                        // tslint:disable-next-line:max-line-length
                        const zippedData: number[][] = _.zip(regionData.shape_attributes.all_points_x, regionData.shape_attributes.all_points_y);
                        const points = zippedData
                            .map((pointTuple: number[]) => ({
                                x: pointTuple[0],
                                y: pointTuple[1]
                            }));
                        return {
                            id: v4(),
                            image,
                            label: regionData.region_attributes.label,
                            points
                        }
                    })
            })
            .flat();
    }
}