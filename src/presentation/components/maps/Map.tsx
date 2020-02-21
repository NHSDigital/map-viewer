import React, { PureComponent } from "react";
import { Map as LeafletMap } from "leaflet";

interface Map extends PureComponent {
  map: LeafletMap;
}

class Map extends PureComponent {
  render() {
    return <div className="mv-map-container" id="map-container"></div>;
  }
}

export default Map;
