import React, { useState, SyntheticEvent, useEffect } from "react";
import { Details, SummaryList, Select } from "nhsuk-react-components";
import { Dataset } from "../../../core/parsing/version-1/DatasetParser";

export interface IDatasetDisplayOptions {
  displayType: DisplayType;
  fillColour: FillColours;
  bubbleScale: number;
}

interface DatasetDisplayOptionsProps {
  dataset: Dataset;
  onChange: (dataset: Dataset, options: IDatasetDisplayOptions) => any;
}

type DisplayType = "None" | "Bubble" | "Choropleth";

export type FillColours =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "violet";

const textColour: { [key: string]: string } = {
  red: "white",
  orange: "black",
  yellow: "black",
  green: "white",
  blue: "white",
  indigo: "white",
  violet: "black"
};

const DatasetDisplayOptions: React.FC<DatasetDisplayOptionsProps> = ({
  dataset,
  onChange
}) => {
  const [displayType, setDisplayType] = useState<DisplayType>("None");
  const [fillColour, setFillColour] = useState<FillColours>("red");
  const [bubbleScale, setBubbleScale] = useState<number>(20);

  const onDisplayTypeChange = (e: SyntheticEvent<HTMLSelectElement>) => {
    const newDisplayType = e.currentTarget.value as DisplayType;
    setDisplayType(newDisplayType);
  };

  const onFillColourChange = (e: SyntheticEvent<HTMLSelectElement>) => {
    const newColour = e.currentTarget.value as FillColours;
    setFillColour(newColour);
  };

  const onBubbleScaleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    setBubbleScale(Number(e.currentTarget.value));
  };

  useEffect(() => {
    onChange(dataset, { displayType, fillColour, bubbleScale });
  }, [displayType, onChange, dataset, fillColour, bubbleScale]);

  return (
    <Details>
      <Details.Summary>{dataset.meta.name} Options</Details.Summary>
      <Details.Text>
        <SummaryList>
          <SummaryList.Row>
            <SummaryList.Key>Display Type</SummaryList.Key>
            <SummaryList.Actions>
              <Select onChange={onDisplayTypeChange}>
                <Select.Option value="None">None</Select.Option>
                <Select.Option value="Bubble">Bubble</Select.Option>
                <Select.Option value="Choropleth">Choropleth</Select.Option>
              </Select>
            </SummaryList.Actions>
          </SummaryList.Row>
          {displayType === "Bubble" ? (
            <>
              <SummaryList.Row>
                <SummaryList.Key>Fill Colour</SummaryList.Key>
                <SummaryList.Actions>
                  <Select
                    value={fillColour}
                    onChange={onFillColourChange}
                    style={{
                      backgroundColor: fillColour,
                      color: textColour[fillColour]
                    }}
                  >
                    <Select.Option value="red">Red</Select.Option>
                    <Select.Option value="orange">Orange</Select.Option>
                    <Select.Option value="yellow">Yellow</Select.Option>
                    <Select.Option value="green">Green</Select.Option>
                    <Select.Option value="blue">Blue</Select.Option>
                    <Select.Option value="indigo">Indigo</Select.Option>
                    <Select.Option value="violet">Violet</Select.Option>
                  </Select>
                </SummaryList.Actions>
              </SummaryList.Row>
              <SummaryList.Row>
                <SummaryList.Key>Bubble Scale</SummaryList.Key>
                <SummaryList.Value>
                  <input
                    type="range"
                    step={0.5}
                    min="0"
                    max="50"
                    value={bubbleScale}
                    onChange={onBubbleScaleChange}
                  ></input>
                </SummaryList.Value>
              </SummaryList.Row>
            </>
          ) : null}
          {displayType === "Choropleth" ? (
            <>
              <SummaryList.Row>
                <SummaryList.Key>Fill Colour</SummaryList.Key>
                <SummaryList.Actions>
                  <Select
                    value={fillColour}
                    onChange={onFillColourChange}
                    style={{
                      backgroundColor: fillColour,
                      color: textColour[fillColour]
                    }}
                  >
                    <Select.Option value="red">Red</Select.Option>
                    <Select.Option value="orange">Orange</Select.Option>
                    <Select.Option value="yellow">Yellow</Select.Option>
                    <Select.Option value="green">Green</Select.Option>
                    <Select.Option value="blue">Blue</Select.Option>
                    <Select.Option value="indigo">Indigo</Select.Option>
                    <Select.Option value="violet">Violet</Select.Option>
                  </Select>
                </SummaryList.Actions>
              </SummaryList.Row>
              <SummaryList.Row>
                <SummaryList.Key>Boundary</SummaryList.Key>
                <SummaryList.Actions>
                  <Select>
                    <Select.Option>MSOA</Select.Option>
                    <Select.Option>LSOA</Select.Option>
                    <Select.Option>CCG</Select.Option>
                  </Select>
                </SummaryList.Actions>
              </SummaryList.Row>
            </>
          ) : null}
        </SummaryList>
      </Details.Text>
    </Details>
  );
};

export default DatasetDisplayOptions;

/*<Details key={dataset.meta.name}>
              <Details.Summary>{dataset.meta.name}</Details.Summary>
              <Details.Text>
                <SummaryList>
                  <SummaryList.Row>
                    <SummaryList.Key>Display Type</SummaryList.Key>
                    <SummaryList.Actions>
                      <Select>
                        <Select.Option>None</Select.Option>
                        <Select.Option>Bubble</Select.Option>
                      </Select>
                    </SummaryList.Actions>
                  </SummaryList.Row>
                  <SummaryList.Row>
                    <SummaryList.Key>Bubble Scale</SummaryList.Key>
                    <SummaryList.Actions>
                      <input type="range" />
                    </SummaryList.Actions>
                  </SummaryList.Row>
                </SummaryList>
              </Details.Text>
            </Details>
*/
