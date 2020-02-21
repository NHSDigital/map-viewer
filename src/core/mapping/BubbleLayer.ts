import {
  Dataset,
  DatasetMetadataRow
} from "../parsing/version-1/DatasetParser";
import { Map, Circle } from "leaflet";
import Axios from "axios";
import L from "leaflet";
import { IDatasetDisplayOptions } from "../../presentation/components/maps/DatasetDisplayOptions";

type FieldType = "quantifier" | "descriptor" | "location" | "unknown";

interface SplitFields {
  location: Array<DatasetMetadataRow>;
  quantifier: Array<DatasetMetadataRow>;
  descriptor: Array<DatasetMetadataRow>;
  unknown: Array<DatasetMetadataRow>;
}

interface PreferredFields {
  location: string | null;
  quantifier: string | null;
  descriptor: string | null;
  unknown: string | null;
}

interface PostcodesIOResponse {
  query: string;
  result?: {
    latitude: number;
    longitude: number;
  };
}

class BubbleLayer {
  public isValid: boolean = true;
  public validationFailure: string | null = null;
  private dataset: Dataset;
  private postcodeMap: { [postcode: string]: [number, number] } = {};
  private leafletCircles: Array<Circle> = [];
  private map: Map;
  private options: IDatasetDisplayOptions;
  public static layerType: string = "Bubble";

  private preferredFields: PreferredFields = {
    location: null,
    quantifier: null,
    descriptor: null,
    unknown: null
  };

  constructor(dataset: Dataset, map: Map, options: IDatasetDisplayOptions) {
    this.dataset = dataset;
    this.map = map;
    this.options = options;
    this.process().then(valid => this.isValid === valid);
  }

  private process = async (): Promise<boolean> => {
    const fields = this.splitFields();

    if (!this.dataset.data.rows) {
      this.validationFailure = "Dataset has no rows";
      return false;
    } else if (fields.location.length === 0) {
      this.validationFailure = "No location field specified within dataset.";
      return false;
    } else if (
      fields.location.length > 1 &&
      this.preferredFields.location === null
    ) {
      this.validationFailure =
        "Multiple location fields specified within dataset.";
      return false;
    } else if (
      fields.quantifier.length > 1 &&
      this.preferredFields.quantifier === null
    ) {
      this.validationFailure =
        "Multiple quantifier fields specified within dataset.";
      return false;
    }
    const locationField = this.preferredFields.location
      ? fields.location.find(x => x.name === this.preferredFields.location)
      : fields.location[0];

    if (!locationField) {
      this.validationFailure = "Unable to discern location field.";
      return false;
    }

    if (locationField.format === "postcode") {
      await this.buildPostcodeMap(locationField);
    }

    const circles = this.dataset.data.rows.map(row => {
      if (locationField.format === "postcode") {
        const latLng = this.postcodeMap[row[locationField.name]];
        if (!latLng) {
          return {
            success: false,
            row
          };
        }
        let circle;
        if (fields.quantifier.length === 0) {
          circle = L.circle(latLng, {
            radius: 200 * this.options.bubbleScale
          });
        } else {
          circle = L.circle(latLng, {
            radius:
              Number(row[fields.quantifier[0].name]) * this.options.bubbleScale,
            fillColor: this.options.fillColour,
            color: this.options.fillColour
          });
        }

        const text = [...fields.descriptor, ...fields.quantifier]
          .map(field => `${field.name}: ${row[field.name]}`)
          .join("<br />");

        circle.bindPopup(text);

        return {
          success: true,
          circle: circle
        };
      } else if (locationField.format === "coordinates") {
        // TODO: Coordinates!
        return {
          success: false,
          row
        };
      }
      return {
        success: false,
        row
      };
    });

    const { bubbles } = circles.reduce<{
      bubbles: Array<Circle>;
      failedRows: Array<any>;
    }>(
      (prevValue, nextValue) => {
        if (nextValue.success && nextValue.circle) {
          prevValue.bubbles.push(nextValue.circle);
        } else {
          prevValue.failedRows.push(nextValue.row);
        }
        return prevValue;
      },
      { bubbles: [], failedRows: [] }
    );

    this.addToMap(bubbles);

    return true;
  };

  public updateOptions = (options: IDatasetDisplayOptions) => {
    this.options = options;
    this.removeFromMap();
    this.process();
  };

  private buildPostcodeMap = async (locationField: DatasetMetadataRow) => {
    if (!this.dataset.data.rows) return;
    if (Object.keys(this.postcodeMap).length > 0) return;

    const bundledPostcodes = this.dataset.data.rows
      .map(row => row[locationField.name])
      .reduce<string[][]>(
        (prevValue: string[][], nextValue: string) => {
          if (prevValue[prevValue.length - 1].length === 50) {
            prevValue.push([nextValue]);
          } else {
            prevValue[prevValue.length - 1].push(nextValue);
          }
          return prevValue;
        },
        [[]]
      );

    const results = (
      await Promise.all(bundledPostcodes.map(this.fetchPostcodes))
    ).reduce((x, y) => ({ ...x, ...y }));
    this.postcodeMap = { ...this.postcodeMap, ...results };
  };

  private fetchPostcodes = async (postcodeBatch: string[]) => {
    const response = await Axios.post("https://api.postcodes.io/postcodes", {
      postcodes: postcodeBatch
    });
    return response.data.result.reduce(
      (
        prevValue: { [postcode: string]: number[] },
        nextValue: PostcodesIOResponse
      ) => {
        if (nextValue && nextValue.result) {
          prevValue[nextValue.query] = [
            nextValue.result.latitude,
            nextValue.result.longitude
          ];
        }
        return prevValue;
      },
      {}
    );
  };

  private splitFields = () => {
    return this.dataset.meta.rows.reduce<SplitFields>(
      (prevValue, nextValue) => {
        if (nextValue.datatype === "descriptor") {
          prevValue.descriptor.push(nextValue);
        } else if (nextValue.datatype === "location") {
          prevValue.location.push(nextValue);
        } else if (nextValue.datatype === "quantifier") {
          prevValue.quantifier.push(nextValue);
        } else if (nextValue.datatype === "unknown") {
          prevValue.unknown.push(nextValue);
        }
        return prevValue;
      },
      { location: [], quantifier: [], descriptor: [], unknown: [] }
    );
  };

  private addToMap = (newCircles: Array<Circle>) => {
    this.removeFromMap();
    this.leafletCircles = newCircles;
    this.leafletCircles.forEach(circle => {
      circle.addTo(this.map);
    });
  };

  public removeFromMap = () => {
    this.leafletCircles.forEach(circle => {
      this.map.removeLayer(circle);
    });
    this.leafletCircles = [];
  };

  private setField = (fieldName: string, fieldType: FieldType): boolean => {
    const field = this.dataset.meta.rows.find(x => x.name === fieldName);
    if (!field) {
      return false;
    }
    if (field.datatype !== fieldType) {
      return false;
    }
    this.preferredFields[fieldType] = fieldName;
    return true;
  };

  public setLocationField = (fieldName: string): boolean => {
    return this.setField(fieldName, "location");
  };

  public setQuantifierField = (fieldName: string): boolean => {
    return this.setField(fieldName, "quantifier");
  };
}

export default BubbleLayer;
