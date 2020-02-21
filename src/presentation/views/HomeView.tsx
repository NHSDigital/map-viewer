import React from "react";
import { BodyText } from "nhsuk-react-components";
import FileUpload from "../components/FileUpload";

const HomeView = () => (
  <>
    <h1 className="mv-margin-none mt-margin-b10">Data Upload</h1>
    <BodyText>
      Upload your exported CSV file in order to use the DigiTrial map viewer.
    </BodyText>
    <FileUpload />
  </>
);

export default HomeView;
