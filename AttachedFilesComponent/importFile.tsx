import * as React from "react";
import { Button } from "@fluentui/react-components";
import { useState, createRef, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import { IControlEvent, PowerFxFileType } from "./fileSchema";

interface IFileData {
  name: string;
  size: number;
  type: string; // <-- add this
  contentBytes: string;
  error?: string;
}

export interface IImportProps {
  buttonLabel: string | null;
  onEvent: (event: IControlEvent) => void;
  showIcon: boolean;
  maxFileSizeKB: number;
  onButtonSizeChange: (width: number, height: number) => void;
}

export const ImportFile: React.FC<IImportProps> = (props: IImportProps) => {
  const [imported, setImported] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const importFileRef = createRef<HTMLInputElement>();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Monitor button size changes
  useEffect(() => {
    if (buttonRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          props.onButtonSizeChange(width, height);
        }
      });

      resizeObserver.observe(buttonRef.current);

      // Initial size report
      const rect = buttonRef.current.getBoundingClientRect();
      props.onButtonSizeChange(rect.width, rect.height);

      return () => resizeObserver.disconnect();
    }
  }, [props.onButtonSizeChange]);

  const readFile = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.onloadend = () => {
        resolve(reader.result);
      };

      reader.readAsDataURL(file);
    });
  };

  const getAsByteArray = async (file: File) => {
    try {
      let fileContent: string | null = (await readFile(file)) as string | null;
      return fileContent?.split(",")?.[1];
    } catch (error) {
      throw new Error("Failed to process file content");
    }
  };

  const validateFileSize = (file: File): boolean => {
    const fileSizeKB = file.size / 1024;
    return fileSizeKB <= props.maxFileSizeKB;
  };

  const onFileChange = async (event: any) => {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      const allFiles: File[] = Array.from(files);

      const validFiles = allFiles.filter((file) => validateFileSize(file));
      const invalidFiles = allFiles.filter((file) => !validateFileSize(file));

      const validFilesData: IFileData[] = await Promise.all(
        validFiles.map(async (file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          contentBytes: (await getAsByteArray(file)) ?? "",
          error: "",
        }))
      );

      const invalidFilesData: IFileData[] = invalidFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        contentBytes: "",
        error: `File too large (${Math.round(file.size / 1024)}KB)`,
      }));

      const allErrors = invalidFilesData.length > 0;

      props.onEvent({
        event: "ImportedFile",
        errorMessage: allErrors ? "Some files were too large and skipped." : "",
        jsonData: JSON.stringify({
          value: validFilesData, // ✅ ONLY VALID FILES SENT
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                size: { type: "number" },
                type: { type: "string" },
                contentBytes: { type: "string" },
                error: { type: "string" },
              },
            },
          },
        }),
      });
      if (invalidFilesData.length > 0) {
        props.onEvent({
          event: "Error",
          errorMessage: `Skipped ${invalidFilesData.length} file(s) due to size limits.`,
          jsonData: JSON.stringify({
            value: invalidFilesData,
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  size: { type: "number" },
                  type: { type: "string" },
                  contentBytes: { type: "string" },
                  error: { type: "string" },
                },
              },
            },
          }),
        });
      }
      setImported(true);
    } catch (error) {
      props.onEvent({
        event: "Error",
        errorMessage:
          error instanceof Error ? error.message : "Failed to process files",
        jsonData: "",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const getButtonText = () => {
    // if (isProcessing) return "Processing...";
    // if (imported) return "File Imported";
    return props.buttonLabel || "Import File";
  };

  const shouldShowIcon = () => {
    return props.showIcon && !isProcessing;
  };

  return (
    <div style={{ display: "inline-block" }}>
      <Button
        ref={buttonRef}
        onClick={() => importFileRef.current?.click()}
        iconPosition="after" // Show icon to the right
        icon={props.showIcon ? <Upload /> : null} // Use null instead of empty string for no icon
        disabled={isProcessing}
        appearance="outline"
        style={{
          borderRadius: "999px", // Fully rounded
          border: "1px solid #ccc", // Light border
          backgroundColor: "#fff",
          color: "#000",
          fontWeight: 400,
          fontSize: "14px",
          padding: props.showIcon ? "6px 12px" : "6px 16px", // Adjust padding based on icon presence
          height: "32px",
          minWidth: props.showIcon ? "fit-content" : "60px", // Set a minimum width when no icon
          width: props.showIcon ? undefined : "auto", // Let it be auto width when no icon
          boxShadow: "none",
        }}
      >
        {props.buttonLabel || "Pièce jointe"}
      </Button>
      <input
        ref={importFileRef}
        type="file"
        onChange={onFileChange}
        key={Math.random().toString(16)}
        style={{ display: "none" }}
        disabled={isProcessing}
        multiple
      />
    </div>
  );
};
