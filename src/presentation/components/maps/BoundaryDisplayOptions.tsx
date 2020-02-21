import React, { useState, useEffect, SyntheticEvent } from "react";
import { SummaryList, Select } from "nhsuk-react-components";
import {
  IBoundaryLayerOptions,
  DefaultBoundaryLayerOptions
} from "../../../core/mapping/BoundaryLayer";
import { FillColours } from "./DatasetDisplayOptions";

interface BoundaryDisplayOptionsProps {
  open: boolean;
  type: "lsoa" | "msoa" | "ccg";
  onChange: (
    type: "lsoa" | "msoa" | "ccg",
    options: IBoundaryLayerOptions
  ) => void;
}

const BoundaryDisplayOptions: React.FC<BoundaryDisplayOptionsProps> = ({
  open,
  type,
  onChange
}) => {
  const [fillColour, setFillColour] = useState<FillColours>(
    DefaultBoundaryLayerOptions.fillColour
  );
  const [lineWidth, setLineWidth] = useState<number>(
    DefaultBoundaryLayerOptions.lineWidth
  );
  const [fillOpacity, setFillOpacity] = useState<number>(
    DefaultBoundaryLayerOptions.fillOpacity
  );
  const [lineOpacity, setLineOpacity] = useState<number>(
    DefaultBoundaryLayerOptions.lineOpacity
  );

  const onFillColourChange = (e: SyntheticEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value as FillColours;
    setFillColour(value);
  };

  const onFillOpacityChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const value = Number(e.currentTarget.value);
    setFillOpacity(value);
  };

  const onLineOpacityChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const value = Number(e.currentTarget.value);
    setLineOpacity(value);
  };

  const onLineWidthChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const value = Number(e.currentTarget.value);
    setLineWidth(value);
  };

  useEffect(() => {
    onChange(type, {
      fillColour,
      lineWidth,
      fillOpacity,
      lineOpacity
    });
  }, [fillColour, fillOpacity, lineOpacity, lineWidth, onChange, type]);

  if (!open) return null;
  return (
    <div className="nhsuk-checkboxes__conditional">
      <SummaryList>
        <SummaryList.Row>
          <SummaryList.Key>Fill Colour</SummaryList.Key>
          <SummaryList.Actions>
            <Select onChange={onFillColourChange}>
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
          <SummaryList.Key>Line Width</SummaryList.Key>
          <SummaryList.Actions>
            <input
              type="range"
              min={1}
              max={10}
              value={lineWidth}
              onChange={onLineWidthChange}
            ></input>
          </SummaryList.Actions>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>Fill Opacity</SummaryList.Key>
          <SummaryList.Actions>
            <input
              type="range"
              step={0.025}
              min={0}
              max={0.5}
              value={fillOpacity}
              onChange={onFillOpacityChange}
            ></input>
          </SummaryList.Actions>
        </SummaryList.Row>
        <SummaryList.Row>
          <SummaryList.Key>Line Opacity</SummaryList.Key>
          <SummaryList.Actions>
            <input
              type="range"
              step={0.05}
              min={0}
              max={1}
              value={lineOpacity}
              onChange={onLineOpacityChange}
            ></input>
          </SummaryList.Actions>
        </SummaryList.Row>
      </SummaryList>
    </div>
  );
};

export default BoundaryDisplayOptions;
