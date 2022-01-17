import {AnnotationFormatType} from "../../data/enums/AnnotationFormatType";
import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {ImageData, LabelLine, LabelName} from "../../store/labels/types";
import {ExporterUtil} from "../../utils/ExporterUtil";
import {ImageRepository} from "../imageRepository/ImageRepository";
import {findLast} from "lodash";
import {Line} from './AnalyticGeometry';
import {v4} from 'uuid';

export class LineLabelsExporter {
    public static export(exportFormatType: AnnotationFormatType): void {
        switch (exportFormatType) {
            case AnnotationFormatType.CSV:
                LineLabelsExporter.exportAsCSV();
                break;
            default:
                return;
        }
    }

    public static exportAsCSV(): void {
        const content: string = LabelsSelector.getImagesData()
            .map((imageData: ImageData) => {
                return LineLabelsExporter.wrapLineLabelsIntoCSV(imageData)
            })
            .filter((imageLabelData: string) => {
                return !!imageLabelData
            })
            .join("\n");
        const fileName: string = `${ExporterUtil.getExportFileName()}.csv`;
        ExporterUtil.saveAs(content, fileName);
    }

    public static exportData(): Line[] {
        return LabelsSelector.getImagesData()
            .filter((imageData: ImageData) => imageData.labelLines.length !== 0 && imageData.loadStatus)
            .map((imageData: ImageData) => {
                const labelNames: LabelName[] = LabelsSelector.getLabelNames();
                return imageData.labelLines
                    .filter((labelLine: LabelLine) => !!findLast(labelNames, {id: labelLine.labelId}))
                    .map((labelLine: LabelLine) => {
                        return {
                            id: v4(),
                            image: imageData.fileData.name,
                            label: findLast(labelNames, {id: labelLine.labelId}).name,
                            x1: labelLine.line.start.x,
                            y1: labelLine.line.start.y,
                            x2: labelLine.line.end.x,
                            y2: labelLine.line.end.y
                        };
                    });
            })
            .flat();
    }

    private static wrapLineLabelsIntoCSV(imageData: ImageData): string {
        if (imageData.labelLines.length === 0 || !imageData.loadStatus)
            return null;

        const image: HTMLImageElement = ImageRepository.getById(imageData.id);
        const labelNames: LabelName[] = LabelsSelector.getLabelNames();
        const labelLinesString: string[] = imageData.labelLines.map((labelLine: LabelLine) => {
            const labelName: LabelName = findLast(labelNames, {id: labelLine.labelId});
            const labelFields = !!labelName ? [
                labelName.name,
                Math.round(labelLine.line.start.x).toString(),
                Math.round(labelLine.line.start.y).toString(),
                Math.round(labelLine.line.end.x).toString(),
                Math.round(labelLine.line.end.y).toString(),
                imageData.fileData.name,
                image.width.toString(),
                image.height.toString()
            ] : [];
            return labelFields.join(",")
        });
        return labelLinesString.join("\n");
    }
}