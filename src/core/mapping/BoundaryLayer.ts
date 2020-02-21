import L, { Map } from "leaflet";
import BoundaryOverlayContainer from "../../presentation/functional/BoundaryOverlayContainer";
import { Point } from "geojson";
import { FillColours } from "../../presentation/components/maps/DatasetDisplayOptions";

export interface IBoundaryLayerOptions {
  fillColour: FillColours;
  lineWidth: number;
  fillOpacity: number;
  lineOpacity: number;
}

export const DefaultBoundaryLayerOptions: IBoundaryLayerOptions = {
  fillColour: "red",
  lineWidth: 1,
  fillOpacity: 0.2,
  lineOpacity: 0.8
};

interface BoundaryLayer {
  boundaryType: "msoa" | "lsoa" | "ccg";
  map: Map;
  boundaryContainer: BoundaryOverlayContainer;
  options: IBoundaryLayerOptions;
}

class BoundaryLayer {
  private geoJsonLayer: L.GeoJSON | null = null;

  constructor(
    boundaryType: "msoa" | "lsoa" | "ccg",
    map: Map,
    boundaryContainer: BoundaryOverlayContainer,
    options: IBoundaryLayerOptions
  ) {
    this.map = map;
    this.boundaryContainer = boundaryContainer;
    this.boundaryType = boundaryType;
    this.options = options;
    this.process();
  }

  private process = async () => {
    let data: null | Point = null;

    if (this.boundaryType === "msoa") {
      if (this.boundaryContainer.boundaryData.msoa === null)
        await this.boundaryContainer.loadMSOAData();
      data = this.boundaryContainer.boundaryData.msoa as Point;
    } else if (this.boundaryType === "ccg") {
      if (this.boundaryContainer.boundaryData.ccg === null) {
        await this.boundaryContainer.loadCCGData();
      }
      data = this.boundaryContainer.boundaryData.ccg as Point;
    }

    if (!data) return;

    this.removeFromMap();
    this.geoJsonLayer = L.geoJSON(data, {
      style: {
        fillColor: this.options.fillColour,
        color: this.options.fillColour,
        weight: this.options.lineWidth,
        fillOpacity: this.options.fillOpacity,
        opacity: this.options.lineOpacity
      }
    });
    this.addToMap();
  };

  public addToMap = () => {
    if (this.geoJsonLayer) {
      this.geoJsonLayer.addTo(this.map);
    }
  };

  public removeFromMap = () => {
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }
    this.geoJsonLayer = null;
  };

  public updateOptions = (options: IBoundaryLayerOptions) => {
    this.options = options;
    this.process();
  };
}

export default BoundaryLayer;
