/** Browser command for downloading text content. */
export type DownloadMapCommand = Readonly<{
  type: "downloadText";
  filename: string;
  text: string;
}>;

/** Browser command for reading a JSON file upload. */
export type ReadJsonFileCommand = Readonly<{
  type: "readJsonFile";
  file: File;
}>;

/** Quilt browser command ADT. */
export type QuiltBrowserCommand = DownloadMapCommand | ReadJsonFileCommand;

/** Input for creating a download command. */
export type CreateDownloadMapCommandInput = Readonly<{
  filename: string;
  text: string;
}>;

/** Input for creating a read JSON file command. */
export type CreateReadJsonFileCommandInput = Readonly<{
  file: File;
}>;

/** Creates browser command data outside the Web Component class. */
export const createDownloadMapCommand = (
  input: CreateDownloadMapCommandInput,
): DownloadMapCommand => ({
  filename: input.filename,
  text: input.text,
  type: "downloadText",
});

/** Creates a read JSON file command data outside the Web Component class. */
export const createReadJsonFileCommand = (
  input: CreateReadJsonFileCommandInput,
): ReadJsonFileCommand => ({
  file: input.file,
  type: "readJsonFile",
});
