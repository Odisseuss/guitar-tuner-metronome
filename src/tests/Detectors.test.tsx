// TODO: Write automated tests that compare the performance of the two detectors.
import * as React from "react";
import functions from "../components/Functions";
import fs from "fs";
import detectors from "../components/Detectors";
import { resolve } from "path";
//@ts-nocheck
import WavDecoder from "wav-decoder";

const path = (...args: Array<string>): string => resolve(__dirname, ...args);
const decode = (buffer: Buffer): Float32Array => {
  const decoded: {
    sampleRate: number;
    channelData: Array<Float32Array>;
  } = WavDecoder.decode.sync(buffer);
  return decoded.channelData[0];
};
async function getYin() {
  let yin = await detectors.YIN();
  if (yin) return yin;
}
test("Detector Tests", async () => {
  const yin = await getYin();
  if (yin)
    describe("Pitchfinder", () => {
      const det = {
        AC: (buffer: Float32Array) => detectors.autocorellation(buffer, 44100),
        YIN: (buffer: Float32Array) => yin(buffer, 0.1, 44100, 0.1),
      };

      const pitchSamples = fs.readdirSync(path("pitches"));

      describe("Detectors", () => {
        Object.keys(detectors).forEach((name) => {
          const detector = functions.getProperty(det, name as "AC" | "YIN");
          describe(name, () => {
            pitchSamples.forEach((fileName) => {
              const [hz, type] = fileName.replace(".wav", "").split("_");

              test(`Detects ${type} wave at ${hz} hz`, () => {
                return fs.readFile(path("pitches", fileName), (err, data) => {
                  let decoded = decode(data);
                  let pitch = detector(decoded);
                  if (pitch == null) throw new Error("No frequency detected");
                  const diff = Math.abs(pitch - Number(hz));
                  // eslint-disable-next-line jest/no-conditional-expect
                  expect(diff).toBeLessThan(10);
                  if (diff > 10)
                    throw new Error(
                      `Too large an error - detected wave at ${hz} as ${pitch} hz`
                    );
                });
              });
            });
          });
        });
      });
    });
  // describe("16th-note quantization (default)", () => {
  //   it("YIN is accurate but misses one frequency", () => {
  //     return fs
  //       .readFile(path("melodies", sample), (err, data) => {
  //         let decoded = decode(data);
  //         let pitch = detectors.YIN(decoded);
  //       })
  //       .then(decode)
  //       .then((data) => Pitchfinder.frequencies(detectors.YIN, data))
  //       .then((frequencies) => {
  //         expect(frequencies.map(round)).toEqual([
  //           261.7419,
  //           261.7137,
  //           261.6266,
  //           261.6543,
  //           293.1462,
  //           293.6443,
  //           293.6985,
  //           293.582,
  //           329.0285,
  //           329.7834,
  //           329.6526,
  //           329.8027,
  //           349.3526,
  //           349.2973,
  //           349.3851,
  //           19018.1432,
  //           392.1011,
  //           391.9778,
  //           392.2077,
  //           392.2192,
  //           439.3881,
  //           440.3376,
  //           440.3561,
  //           440.4005,
  //           492.092,
  //           493.6956,
  //           494.2412,
  //           494.0726,
  //           523.069,
  //           522.9648,
  //           523.3838,
  //         ]);
  //       });
  //   });
  // });
});
