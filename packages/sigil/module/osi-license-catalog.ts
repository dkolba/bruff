/** One selectable OSI license option. */
export type SigilLicenseOption = Readonly<{
  id: string;
  name: string;
  spdxId: string | undefined;
  label: string;
  value: string;
}>;

/** Generated OSI license options used by the sigil browser tool. */
export const OSI_LICENSE_OPTIONS: ReadonlyArray<SigilLicenseOption> = [
  {
    id: "apache-2-0",
    label: "Apache License, Version 2.0 (Apache-2.0)",
    name: "Apache License, Version 2.0",
    spdxId: "Apache-2.0",
    value: "Apache-2.0",
  },
  {
    id: "mit",
    label: "MIT License (MIT)",
    name: "MIT License",
    spdxId: "MIT",
    value: "MIT",
  },
  {
    id: "ofl-1-1",
    label: "SIL Open Font License 1.1 (OFL-1.1)",
    name: "SIL Open Font License 1.1",
    spdxId: "OFL-1.1",
    value: "OFL-1.1",
  },
  {
    id: "bsd2c",
    label: "The 2-Clause BSD License",
    name: "The 2-Clause BSD License",
    spdxId: "BSD-2-Clause",
    value: "BSD-2-Clause",
  },
  {
    id: "bsd3c",
    label: "The 3-Clause BSD License",
    name: "The 3-Clause BSD License",
    spdxId: "BSD-3-Clause",
    value: "BSD-3-Clause",
  },
];
