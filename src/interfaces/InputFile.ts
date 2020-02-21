export type InputFileVersion = "1.0.0";

interface InputFileMetaInfo {
  version: InputFileVersion;
  dateGenerated: Date;
}

interface OrderedDataRow {
  _order: number;
}

interface InputFileDatasetOrdered {
  $meta: {
    preserveOrder: true;
  };
  data: Array<OrderedDataRow>;
}

interface UnorderedDataRow {}

interface InputFileDatasetUnordered {
  $meta: {
    preserveOrder: false;
  };
  data: Array<UnorderedDataRow>;
}

type InputFileDataset = InputFileDatasetOrdered | InputFileDatasetUnordered;

export interface InputFileV1 {
  $meta: InputFileMetaInfo;
  datasets: Array<InputFileDataset>;
}

export type InputFile = InputFileV1;
