import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const LICENSE_API_URL = "https://opensource.org/api/license";
const OUTPUT_FILE = fileURLToPath(
  new URL("../module/osi-license-catalog.ts", import.meta.url),
);

const isRecord = (input) =>
  typeof input === "object" && input !== null && !Array.isArray(input);

const stringField = (record, fieldName) => {
  const fieldValue = record[fieldName];
  return typeof fieldValue === "string" && fieldValue.length > 0
    ? fieldValue
    : undefined;
};

const licenseEntries = (input) => {
  if (Array.isArray(input)) {
    return input.filter(isRecord);
  }

  if (!isRecord(input)) {
    return [];
  }

  const licenses = input.licenses;
  return Array.isArray(licenses) ? licenses.filter(isRecord) : [];
};

const normalizeLicense = (license) => {
  const id = stringField(license, "id");
  const name = stringField(license, "name");
  const spdxId =
    stringField(license, "spdx_id") ?? stringField(license, "spdxId");

  if (id === undefined || name === undefined) {
    return undefined;
  }

  const value = spdxId ?? id;
  return {
    id,
    label: spdxId === undefined ? name : `${name} (${spdxId})`,
    name,
    spdxId,
    value,
  };
};

const normalizeLicenses = (input) =>
  licenseEntries(input)
    .map(normalizeLicense)
    .filter((licenseOption) => licenseOption !== undefined)
    .sort((left, right) => left.name.localeCompare(right.name));

const generatedSource = (
  licenseOptions,
) => `/** One selectable OSI license option. */
export type SigilLicenseOption = Readonly<{
  id: string;
  name: string;
  spdxId: string | undefined;
  label: string;
  value: string;
}>;

/** Generated OSI license options used by the sigil browser tool. */
export const OSI_LICENSE_OPTIONS: ReadonlyArray<SigilLicenseOption> = ${JSON.stringify(
  licenseOptions,
  null,
  2,
)};
`;

const response = await fetch(LICENSE_API_URL);
if (!response.ok) {
  process.stderr.write(`Failed to fetch OSI licenses: ${response.status}\n`);
  process.exitCode = 1;
} else {
  const licenseOptions = normalizeLicenses(await response.json());
  if (licenseOptions.length === 0) {
    process.stderr.write("Failed to generate any OSI license options.\n");
    process.exitCode = 1;
  } else {
    await mkdir(dirname(OUTPUT_FILE), { recursive: true });
    await writeFile(OUTPUT_FILE, generatedSource(licenseOptions), "utf8");
  }
}
