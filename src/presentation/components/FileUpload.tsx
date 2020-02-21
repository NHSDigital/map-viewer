import React, {
  useRef,
  MouseEvent,
  useState,
  SyntheticEvent,
  useContext
} from "react";
import UploadIcon from "./UploadIcon.svg";
import { BodyText, Button } from "nhsuk-react-components";
import { IAppStateContext, AppStateContext } from "../functional/AppState";

const SUPPORTED_MIMETYPES = ["text/csv"];

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileEl = useRef<HTMLInputElement>(null);
  const appStateContext = useContext<IAppStateContext>(AppStateContext);

  const onButtonClick = (e: MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    fileEl.current?.click();
  };

  const onFileSelect = (e: SyntheticEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const currentFiles = e.currentTarget.files;
    if (currentFiles !== null && currentFiles.length > 0) {
      const file = currentFiles.item(0);
      setSelectedFile(file);
    }
  };

  const onSubmit = (_e: MouseEvent<HTMLButtonElement>) => {
    if (selectedFile != null) {
      appStateContext.submitFile(selectedFile);
    }
  };

  return (
    <>
      <input
        ref={fileEl}
        type="file"
        onChange={onFileSelect}
        accept="text/csv"
        style={{ display: "none" }}
      />
      <div className="mv-file-upload">
        {selectedFile ? (
          <div className="mv-file-upload-confirmation">
            <h3 className="mv-file-upload-confirmation__title">
              Upload Confirmation
            </h3>
            <BodyText>File Name: {selectedFile.name}</BodyText>
            <BodyText
              className={
                SUPPORTED_MIMETYPES.includes(selectedFile.type)
                  ? "mv-file-upload-confirmation__supported"
                  : "mv-file-upload-confirmation__unsupported"
              }
            >
              {SUPPORTED_MIMETYPES.includes(selectedFile.type)
                ? "This file type is supported."
                : "This file type is unsupported."}
            </BodyText>
            <Button secondary onClick={onSubmit}>
              Submit
            </Button>
          </div>
        ) : (
          <div className="mv-file-upload-button" onClick={onButtonClick}>
            <img
              src={UploadIcon}
              alt="Upload Icon"
              className="mv-file-upload-button__icon"
            />
            <h3 className="mv-file-upload-button__text">Upload</h3>
          </div>
        )}
      </div>
    </>
  );
};

export default FileUpload;
