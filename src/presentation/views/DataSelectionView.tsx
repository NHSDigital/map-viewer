import React, { useContext } from "react";
import { IAppStateContext, AppStateContext } from "../functional/AppState";
import {
  Table,
  Hint,
  SummaryList,
  Panel,
  Button
} from "nhsuk-react-components";
import { withRouter, RouteComponentProps } from "react-router-dom";

const DataSelectionView: React.FC<RouteComponentProps> = ({ history }) => {
  const appState = useContext<IAppStateContext>(AppStateContext);
  return (
    <>
      <h1 className="mv-margin-none mt-margin-b10">Data Preview</h1>

      <Panel label="Bundle Details">
        <SummaryList>
          <SummaryList.Row>
            <SummaryList.Key>Name</SummaryList.Key>
            <SummaryList.Value>
              {appState.parsedFile.metadata.name}
            </SummaryList.Value>
          </SummaryList.Row>
          <SummaryList.Row>
            <SummaryList.Key>Date Generated</SummaryList.Key>
            <SummaryList.Value>
              {appState.parsedFile.metadata.dateGenerated
                ? appState.parsedFile.metadata.dateGenerated.toDateString()
                : "Unknown"}
            </SummaryList.Value>
          </SummaryList.Row>
        </SummaryList>
      </Panel>
      {appState.parsedFile.datasets.map((dataset, index) => (
        <Panel label={`Dataset ${index + 1} - ${dataset.meta.name}`}>
          <SummaryList>
            <SummaryList.Row>
              <SummaryList.Key>Dataset Name</SummaryList.Key>
              <SummaryList.Value>{dataset.meta.name}</SummaryList.Value>
            </SummaryList.Row>
            <SummaryList.Row>
              <SummaryList.Key>Format</SummaryList.Key>
              <SummaryList.Value>{dataset.meta.format}</SummaryList.Value>
            </SummaryList.Row>
            <SummaryList.Row>
              <SummaryList.Key>Order Preserved</SummaryList.Key>
              <SummaryList.Value>
                {dataset.meta.preserveOrder ? "Yes" : "No"}
              </SummaryList.Value>
            </SummaryList.Row>
          </SummaryList>
          <Hint>Dataset Preview (Top 10 Lines)</Hint>
          <Table>
            <Table.Head>
              <Table.Row>
                {dataset.meta.rows.map(row => (
                  <Table.Cell>{row.name}</Table.Cell>
                ))}
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {dataset.data.rows?.slice(0, 10).map(row => (
                <Table.Row>
                  {dataset.meta.rows.map(column => (
                    <Table.Cell>{row[column.name]}</Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Panel>
      ))}
      <div
        style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}
      >
        <Button secondary style={{ marginRight: 20 }} href="/">
          Go Back
        </Button>
        <Button onClick={() => history.push("/map")}>Continue</Button>
      </div>
    </>
  );
};

export default withRouter(DataSelectionView);
