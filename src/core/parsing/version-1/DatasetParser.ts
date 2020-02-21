import { v4 as uuidv4 } from "uuid";

export type DatasetMetadataRow = {
  name: string;
  type: "string" | "number";
  datatype: "descriptor" | "quantifier" | "unknown" | "location";
  format: "postcode" | "coordinates" | undefined;
};

interface DatasetMetadata {
  _genID: string;
  name: string;
  preserveOrder: boolean;
  format: "jsonlines" | "unknown" | string;
  rows: Array<DatasetMetadataRow>;
}

class DatasetMetadata {
  public rows: Array<DatasetMetadataRow> = [];

  public static parse = (datasetMetadata: any): DatasetMetadata => {
    const parsedMetadata = new DatasetMetadata();

    parsedMetadata.name =
      "name" in datasetMetadata
        ? String(datasetMetadata.name)
        : "Unnamed Dataset";

    parsedMetadata.preserveOrder =
      "preserveOrder" in datasetMetadata
        ? Boolean(datasetMetadata["preserveOrder"])
        : false;

    parsedMetadata.format =
      "format" in datasetMetadata ? String(datasetMetadata.format) : "unknown";

    if ("rows" in datasetMetadata && typeof datasetMetadata.rows === "object") {
      parsedMetadata.rows = datasetMetadata.rows.map(DatasetMetadata.parseRow);
    }

    parsedMetadata._genID = uuidv4();

    return parsedMetadata;
  };

  private static acceptedTypes = ["string", "number"];

  private static acceptedDatatypes = ["descriptor", "quantifier", "location"];

  private static acceptedLocationFormats = ["coordinates", "postcode"];

  private static parseRow = (row: any): DatasetMetadataRow => {
    const datasetRow: DatasetMetadataRow = {
      name: row.name ? row.name : "",
      type: DatasetMetadata.acceptedTypes.includes(row.type)
        ? row.type
        : "unknown",

      datatype: DatasetMetadata.acceptedDatatypes.includes(row.datatype)
        ? row.datatype
        : "unknown",
      format: undefined
    };

    if (datasetRow.datatype === "location") {
      datasetRow.format = DatasetMetadata.acceptedLocationFormats.includes(
        row.format
      )
        ? row.format
        : undefined;
    }

    return datasetRow;
  };
}

interface DatasetData {
  dataQualityIssues: Array<string>;
  rows: Array<any> | null;
}

class DatasetData {
  public static parse = (rawData: any, metadata: DatasetMetadata) => {
    const datasetData = new DatasetData();

    if (metadata.format === "jsonlines") {
      const { dataQualityIssues, rows } = DatasetData.parseJSONLines(
        rawData,
        metadata
      );
      datasetData.dataQualityIssues = dataQualityIssues;
      datasetData.rows = rows;
    }

    return datasetData;
  };

  private static parseJSONLines = (rawData: any, metadata: DatasetMetadata) => {
    if (typeof rawData === "string") {
      let parsedRows = rawData.split("\n").map(x => JSON.parse(x));

      if (metadata.preserveOrder === true) {
        parsedRows = parsedRows.sort((a, b) => {
          if (!("Order" in a && "Order" in b)) {
            return 0;
          }
          return Number(a.Order > b.Order);
        });
      }

      const dqIssues = parsedRows.reduce(
        (prevValue, nextValue, currentIndex) => {
          const rowColumns = [...metadata.rows];
          Object.entries(nextValue).forEach(([key, value]) => {
            const colIndex = rowColumns.findIndex(x => x && x.name === key);
            if (colIndex === -1) {
              prevValue.push(
                `[Row ${currentIndex}] Unknown or Duplicate Key "${key}"`
              );
            } else {
              if (typeof value !== rowColumns[colIndex].type) {
                prevValue.push(
                  `[Row ${currentIndex +
                    1}] Key "${key}" does not match specified type (${
                    rowColumns[colIndex].type
                  })`
                );
              }
              delete rowColumns[colIndex];
            }
          });
          return prevValue;
        },
        []
      );
      return { dataQualityIssues: dqIssues, rows: parsedRows };
    }
    throw new Error("Add another datatype!!");
  };
}

export interface Dataset {
  meta: DatasetMetadata;
  data: DatasetData;
}

export class Dataset {
  public static parse = (dataset: any) => {
    const parsedDataset = new Dataset();

    if ("$meta" in dataset) {
      parsedDataset.meta = DatasetMetadata.parse(dataset.$meta);
    }

    if ("data" in dataset) {
      parsedDataset.data = DatasetData.parse(dataset.data, parsedDataset.meta);
    }

    return parsedDataset;
  };
}
