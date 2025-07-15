import { FileSchema, IControlEvent } from "./fileSchema";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { IImportProps, ImportFile } from "./importFile";


export class AttachedFilesComponent
  implements ComponentFramework.ReactControl<IInputs, IOutputs>
{
  private notifyOutputChanged: () => void;
  private controlEvent: IControlEvent = { event: "None", errorMessage: "" };
  private buttonWidth: number = 0;
  private buttonHeight: number = 0;

  constructor() {
    this.onEvent = this.onEvent.bind(this);
    this.onButtonSizeChange = this.onButtonSizeChange.bind(this);
  }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
  }

  public updateView(
    context: ComponentFramework.Context<IInputs>
  ): React.ReactElement {
    const props: IImportProps = {
      buttonLabel: context.parameters.ImportLabel.raw,
      onEvent: this.onEvent,
      showIcon: context.parameters.ShowIcon.raw,
      maxFileSizeKB: context.parameters.MaxFileSizeKB.raw || 1024, // Default 1MB
      onButtonSizeChange: this.onButtonSizeChange,
    };
    return React.createElement(ImportFile, props);
  }

  public getOutputs(): IOutputs {
    return {
      ...this.controlEvent,
      ButtonWidth: this.buttonWidth,
      ButtonHeight: this.buttonHeight,
    };
  }

  public async getOutputSchema(
    context: ComponentFramework.Context<IInputs>
  ): Promise<any> {
    return Promise.resolve({
      file: FileSchema,
    });
  }

  private onEvent(event: IControlEvent): void {
    this.controlEvent = event;
    this.notifyOutputChanged();
  }

  private onButtonSizeChange(width: number, height: number): void {
    this.buttonWidth = width;
    this.buttonHeight = height;
    this.notifyOutputChanged();
  }

  public destroy(): void {
    // Cleanup if necessary
  }
}