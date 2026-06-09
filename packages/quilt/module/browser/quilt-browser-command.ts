/** Browser command for downloading text content. */
export type DownloadMapCommand = Readonly<{
  type: "downloadText";
  filename: string;
  text: string;
}>;

/** Input for creating a download command. */
export type CreateDownloadMapCommandInput = Readonly<{
  filename: string;
  text: string;
}>;

/** Creates browser command data outside the Web Component class. */
export const createDownloadMapCommand = (
  input: CreateDownloadMapCommandInput,
): DownloadMapCommand => ({
  filename: input.filename,
  text: input.text,
  type: "downloadText",
});
