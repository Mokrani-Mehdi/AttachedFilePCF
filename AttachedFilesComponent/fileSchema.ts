export const FileSchema = {
  "description": "Please select file or image",
  "title": "File",
  "type": "object",
  "properties": {
    "contentBytes": {
      "type": "string",
      "format": "byte"
    },
    "name": {
      "type": "string"
    },
    "size": {
      "type": "number",
      "description": "File size in bytes"
    }
  },
  "x-ms-content-hint": "FILE",
  "x-ms-dynamically-added": true
};

export interface IControlEvent {
  event: "None" | "Completed" | "Error" | "ImportedFile";
  errorMessage?: string;
  jsonData?: string; // New JSON property
}

export interface PowerFxFileType {
  contentBytes: string;
  name: string;
  size: number;
}