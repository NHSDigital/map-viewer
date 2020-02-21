import React, { PureComponent, ContextType, SyntheticEvent } from "react";
import L, { Map as LeafletMap } from "leaflet";
import { Checkboxes, Panel } from "nhsuk-react-components";
import { AppStateContext } from "../functional/AppState";
import DatasetDisplayOptions, {
  IDatasetDisplayOptions
} from "../components/maps/DatasetDisplayOptions";
import Map from "../components/maps/Map";

import BubbleLayer from "../../core/mapping/BubbleLayer";
import { Dataset } from "../../core/parsing/version-1/DatasetParser";
import BoundaryLayer, {
  IBoundaryLayerOptions,
  DefaultBoundaryLayerOptions
} from "../../core/mapping/BoundaryLayer";
import BoundaryDisplayOptions from "../components/maps/BoundaryDisplayOptions";
import BoundaryOverlayContainer from "../functional/BoundaryOverlayContainer";

type MapViewState = {
  currentBoundaries: { [id: string]: BoundaryLayer };
  boundaryOptions: {
    msoa: IBoundaryLayerOptions;
    lsoa: IBoundaryLayerOptions;
    ccg: IBoundaryLayerOptions;
  };
};

class MapView extends PureComponent<{}, MapViewState> {
  static contextType = AppStateContext;

  private currentDatasets: { [id: string]: BubbleLayer } = {};

  private map: LeafletMap | null = null;

  private boundaryOverlayContainer: BoundaryOverlayContainer;

  context!: ContextType<typeof AppStateContext>;

  constructor(props: {}, ...rest: any[]) {
    super(props, ...rest);
    this.state = {
      currentBoundaries: {},
      boundaryOptions: {
        msoa: DefaultBoundaryLayerOptions,
        lsoa: DefaultBoundaryLayerOptions,
        ccg: DefaultBoundaryLayerOptions
      }
    };
    this.boundaryOverlayContainer = new BoundaryOverlayContainer();
  }

  componentDidMount() {
    this.map = L.map("map-container");

    // Center Map over England
    this.map.setView([53, -4], 7);

    L.tileLayer(
      "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        zIndex: 1
      }
    ).addTo(this.map);
  }

  handleDisplayOptionsChange = (
    dataset: Dataset,
    options: IDatasetDisplayOptions
  ) => {
    if (!this.map) return;
    if (options.displayType === "Bubble") {
      if (dataset.meta._genID in this.currentDatasets) {
        this.currentDatasets[dataset.meta._genID].updateOptions(options);
      } else {
        this.currentDatasets[dataset.meta._genID] = new BubbleLayer(
          dataset,
          this.map,
          options
        );
      }
    } else if (options.displayType === "None") {
      if (dataset.meta._genID in this.currentDatasets) {
        this.currentDatasets[dataset.meta._genID].removeFromMap();
        delete this.currentDatasets[dataset.meta._genID];
      }
    }
  };

  onBoundaryChange = async (e: SyntheticEvent<HTMLInputElement>) => {
    const { value } = e.target as HTMLInputElement;
    const { currentBoundaries } = this.state;
    if (!this.map) return;

    if (value in currentBoundaries) {
      currentBoundaries[value].removeFromMap();
      delete currentBoundaries[value];
      this.setState(
        {
          currentBoundaries
        },
        () => this.forceUpdate()
      );
    } else {
      const mapType = value as "msoa" | "lsoa" | "ccg";

      this.setState(
        {
          currentBoundaries: {
            ...currentBoundaries,
            [value]: new BoundaryLayer(
              value as "msoa" | "lsoa" | "ccg",
              this.map,
              this.boundaryOverlayContainer,
              this.state.boundaryOptions[mapType]
            )
          }
        },
        () => this.forceUpdate()
      );
    }
  };

  onOverlayOptionsChange = (
    type: "msoa" | "lsoa" | "ccg",
    options: IBoundaryLayerOptions
  ) => {
    if (type in this.state.currentBoundaries) {
      this.state.currentBoundaries[type].updateOptions(options);
    }
  };

  render() {
    const { currentBoundaries } = this.state;
    return (
      <div className="mv-map-wrapper">
        <div className="mv-map-sidebar">
          <h2 className="nhsuk-panel-with-label__label mv-map-sidebar__title">
            Map Options
          </h2>
          <Panel label="Boundaries">
            <Checkboxes id="Test" onChange={this.onBoundaryChange}>
              <Checkboxes.Box value="msoa">
                Middle Super Outer Areas
              </Checkboxes.Box>
              <BoundaryDisplayOptions
                open={"msoa" in currentBoundaries}
                type="msoa"
                onChange={this.onOverlayOptionsChange}
              />
              <Checkboxes.Box value="lsoa">
                Lower Layer Super Output Areas
              </Checkboxes.Box>
              <BoundaryDisplayOptions
                type="lsoa"
                open={"lsoa" in currentBoundaries}
                onChange={this.onOverlayOptionsChange}
              />
              <Checkboxes.Box value="ccg">
                Clinical Commissioning Groups
              </Checkboxes.Box>
              <BoundaryDisplayOptions
                type="ccg"
                open={"ccg" in currentBoundaries}
                onChange={this.onOverlayOptionsChange}
              />
            </Checkboxes>
          </Panel>

          <Panel label="Datasets">
            {this.context.parsedFile.datasets.map(dataset => (
              <DatasetDisplayOptions
                onChange={this.handleDisplayOptionsChange}
                key={dataset.meta.name}
                dataset={dataset}
              />
            ))}
          </Panel>
        </div>
        <Map />
      </div>
    );
  }
}

export default MapView;
