import {updateActivePopupType} from '../../store/general/actionCreators';
import {PopupWindowType} from '../enums/PopupWindowType';
import {store} from '../../index';
import {MapDataExporter} from '../../logic/export/MapDataExporter';

export type DropDownMenuNode = {
    name: string
    description?: string
    imageSrc: string
    imageAlt: string
    disabled: boolean
    onClick?: () => void
    children?: DropDownMenuNode[]
}

export const DropDownMenuData: DropDownMenuNode[] = [
    {
        name: 'Import Images',
        description: 'Load more images',
        imageSrc: 'ico/camera.png',
        imageAlt: 'images',
        disabled: false,
        onClick: () => store.dispatch(updateActivePopupType(PopupWindowType.IMPORT_IMAGES)),
        children: [
        ]
    },
    {
        name: 'Edit Labels',
        imageSrc: 'ico/tags.png',
        imageAlt: 'labels',
        disabled: false,
        onClick: () => store.dispatch(updateActivePopupType(PopupWindowType.UPDATE_LABEL)),
        children: [
        ]
    },
    {
        name: 'Export',
        imageSrc: 'ico/export-labels.png',
        imageAlt: 'community',
        disabled: false,
        onClick: () => MapDataExporter.exportMap(),
        children: [
        ]
    },
    {
        name: 'Help',
        imageSrc: 'ico/documentation.png',
        imageAlt: 'help',
        disabled: false,
        onClick: () => store.dispatch(updateActivePopupType(PopupWindowType.LOAD_MODEL)),
        children: [
        ]
    }
]

