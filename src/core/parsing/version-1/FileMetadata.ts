export interface FileMetadata {
  name: string;
  dateGenerated: Date | null;
}

export class FileMetadata {
  public static parse = (rawMetadata: any): FileMetadata => {
    const metadata = new FileMetadata();
    metadata.name =
      "name" in rawMetadata ? String(rawMetadata.name) : "Unnamed File";

    if ("dateGenerated" in rawMetadata) {
      metadata.dateGenerated = new Date(rawMetadata.dateGenerated);
    } else {
      metadata.dateGenerated = null;
    }

    return metadata;
  };
}
