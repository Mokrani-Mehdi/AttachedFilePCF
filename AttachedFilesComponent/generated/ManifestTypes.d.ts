/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    ImportLabel: ComponentFramework.PropertyTypes.StringProperty;
    ShowIcon: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    MaxFileSizeKB: ComponentFramework.PropertyTypes.WholeNumberProperty;
    FileSchema: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
    event?: string;
    errorMessage?: string;
    ButtonWidth?: number;
    ButtonHeight?: number;
    file?: any;
    files?: any;
    jsonData?: string;
}
