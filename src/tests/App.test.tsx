import * as React from "react";
import colors from "../colors";

import functions from "../components/Functions";
//@ts-nocheck

describe("GetProperty Helper Func", () => {
  let testObj = { 1: 1, 2: "two", three: 3 };
  test("Returns correct property", () => {
    expect(functions.getProperty(testObj, 1)).toBe(1);
    expect(functions.getProperty(testObj, 2)).toBe("two");
    expect(functions.getProperty(testObj, "three")).toBe(3);
  });
});

describe("DetermineStringBeingTuned Helper Func", () => {
  test("Returns correct string being tuned and color scheme for a tuning", () => {
    expect(functions.determineStringBeingTuned("Standard", 82)).toStrictEqual({
      currentStringBeingTuned: { letter: "E", frequency: 82 },
      currentColors: colors.E,
    });
  });
  test("Returns correct string being tuned and color scheme for a different tuning", () => {
    expect(functions.determineStringBeingTuned("Drop D", 73)).toStrictEqual({
      currentStringBeingTuned: { letter: "D", frequency: 73 },
      currentColors: colors.D,
    });
  });
});
