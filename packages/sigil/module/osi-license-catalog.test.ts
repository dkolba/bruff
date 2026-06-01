import { describe, expect, it } from "vitest";
import { OSI_LICENSE_OPTIONS } from "./osi-license-catalog.js";

const ZERO = 0;

describe("OSI_LICENSE_OPTIONS", () => {
  it("contains normalized license options", () => {
    expect(OSI_LICENSE_OPTIONS.length).toBeGreaterThan(ZERO);
    expect(OSI_LICENSE_OPTIONS[ZERO]).toStrictEqual({
      id: "apache-2-0",
      label: "Apache License, Version 2.0 (Apache-2.0)",
      name: "Apache License, Version 2.0",
      spdxId: "Apache-2.0",
      value: "Apache-2.0",
    });
  });

  it("has unique machine-readable values", () => {
    const values = OSI_LICENSE_OPTIONS.map(
      (licenseOption) => licenseOption.value,
    );

    expect(new Set(values).size).toBe(values.length);
  });

  it("contains representative SPDX identifiers", () => {
    expect(
      OSI_LICENSE_OPTIONS.map((licenseOption) => licenseOption.value),
    ).toEqual(expect.arrayContaining(["Apache-2.0", "MIT", "OFL-1.1"]));
  });
});
