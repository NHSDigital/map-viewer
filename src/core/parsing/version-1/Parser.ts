import { FileMetadata } from "./FileMetadata";
import { Dataset } from "./DatasetParser";

export interface DataParser {
  rawFile: string;
}

export interface ParsedFile {
  metadata: FileMetadata;
  datasets: Array<Dataset>;
}

export class ParsedFile {
  public datasets: Array<Dataset> = [];
}

type ParseAttempt = {
  success: boolean;
  failureReason?: string;
  parsedFile?: ParsedFile;
};

export class DataParser {
  public valid = true;
  public parserVersion = "1.0.0";

  public static parse = (rawFile: string) => {
    const { success, failureReason, parsedFile } = DataParser.attemptParse(
      rawFile
    );
    if (success) {
      return { success, parsedFile };
    } else {
      return { success, failureReason };
    }
  };

  private static attemptParse = (rawFile: string): ParseAttempt => {
    const parsedFile = new ParsedFile();

    const decodedObject = DataParser.jsonDecode(rawFile);

    if (decodedObject === null || typeof decodedObject !== "object") {
      return {
        success: false,
        failureReason: "JSON Decode Failed"
      };
    }

    if (!("$meta" in decodedObject)) {
      return {
        success: false,
        failureReason: "File metadata missing"
      };
    }

    parsedFile.metadata = FileMetadata.parse(decodedObject.$meta);

    if (
      !("datasets" in decodedObject) ||
      typeof decodedObject["datasets"] !== "object"
    ) {
      return {
        success: false,
        failureReason: "No Datasets contained within file"
      };
    }

    parsedFile.datasets = decodedObject.datasets.map((dataset: any) =>
      Dataset.parse(dataset)
    );

    return {
      success: true,
      parsedFile
    };
  };

  static jsonDecode = (rawFile: string): any | null => {
    try {
      return JSON.parse(rawFile);
    } catch {
      return null;
    }
  };
}
