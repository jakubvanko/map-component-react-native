import React from "react";
import { PopupActions } from "../../../logic/actions/PopupActions";
import { GenericYesNoPopup } from "../GenericYesNoPopup/GenericYesNoPopup";
import './LoadModelPopup.scss'

export const LoadModelPopup: React.FC = () => {
    const onReject = () => {
        PopupActions.close();
    };

    const renderContent = () => {
        return <div className="LoadModelPopupContent">
            <div className="Message">
                Welcome to the map annotation editor! <br/><br/>
                You can use the following annotations: <br/>
                - Rooms - draw as polygons<br/>
                - Paths - draw as lines<br/>
                - Elevators / Staircases - draw as points<br/>
                <br />
                All annotations need to have a label that specifies the name of the room. We will automatically
                detect the crossing of rooms and paths or multiple paths and mark these vertices as points of interest.
                The points of interest will be then used to navigate the user. Elevators and staircases will be assigned
                to the line that is closest to them.
            </div>
        </div>
    };

    return (
        <GenericYesNoPopup
            title={"Tutorial"}
            renderContent={renderContent}
            rejectLabel={"I understand"}
            onReject={onReject}
            skipAcceptButton={true}
        />
    );
};