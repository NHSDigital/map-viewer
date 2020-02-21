import { createContext } from "react";

interface IBoundaryOverlayContext {
  loadMSOAData: () => Promise<unknown>;
  loadLSOAData: () => Promise<unknown>;
  loadCCGData: () => Promise<unknown>;
}

export const BoundaryOverlayContext = createContext<IBoundaryOverlayContext>({
  loadCCGData: async () => {},
  loadMSOAData: async () => {},
  loadLSOAData: async () => {}
});

interface BoundaryOverlayContainer {
  boundaryData: {
    msoa: null | object;
    ccg: null | object;
  };
}

class BoundaryOverlayContainer {
  constructor() {
    this.boundaryData = {
      msoa: null,
      ccg: null
    };
  }

  public loadMSOAData = () => {
    return new Promise(resolve => {
      import("../../data/MSOAData.json").then(response => {
        this.boundaryData = { ...this.boundaryData, msoa: response.default };
        resolve();
      });
    });
  };

  public loadCCGData = () => {
    return new Promise(resolve => {
      import("../../data/CCGBoundaries.json").then(response => {
        this.boundaryData = { ...this.boundaryData, ccg: response.default };
        resolve();
      });
    });
  };
}

export default BoundaryOverlayContainer;
