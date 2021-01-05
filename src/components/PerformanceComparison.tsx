import * as React from "react";
import detectors from "../components/Detectors";
// @ts-ignore
import WavDecoder from "wav-decoder";
// @ts-ignore
import saw41 from "../tests/pitches/41_saw.wav";
import sine41 from "../tests/pitches/41_sine.wav";
import triangle41 from "../tests/pitches/41_triangle.wav";
import square41 from "../tests/pitches/41_square.wav";
import triangle65 from "../tests/pitches/65_triangle.wav";
import sine110 from "../tests/pitches/110_sine.wav";
import sine262 from "../tests/pitches/262_sine.wav";
import square440 from "../tests/pitches/440_square.wav";
import triangle988 from "../tests/pitches/988_triangle.wav";
function initSound(url: string) {
  return fetch(url)
    .then((resp) => resp.arrayBuffer())
    .then((arrayBuffer) => arrayBuffer);
}
let pitchSamples = {
  "41_saw": initSound(saw41),
  "41_sine": initSound(sine41),
  "41_triangle": initSound(triangle41),
  "41_square": initSound(square41),
  "65_triangle": initSound(triangle65),
  "110_sine": initSound(sine110),
  "262_sine": initSound(sine262),
  "440_square": initSound(square440),
  "988_triangle": initSound(triangle988),
};

export interface PerformanceComparisonProps {}

const PerformanceComparison: React.FunctionComponent<PerformanceComparisonProps> = () => {
  const decode = (buffer: ArrayBuffer): Float32Array => {
    const decoded: {
      sampleRate: number;
      channelData: Array<Float32Array>;
    } = WavDecoder.decode.sync(buffer);
    return decoded.channelData[0];
  };

  let testAutocorellation = () => {
    console.log("Running test for autocorellation");
    let pitchSamplesLabels = Object.keys(pitchSamples);
    let averageTimeToExecute = 0;
    Object.values(pitchSamples).forEach((sound, index) => {
      const [hz, type] = pitchSamplesLabels[index].split("_");
      console.log(`Running test #${index} on ${type} wave at ${hz} hz`);
      sound.then((buffer) => {
        let decoded = decode(buffer);
        let t0 = performance.now();
        let pitch = detectors.autocorellation(decoded, 44100);
        let t1 = performance.now();
        let timeToExecute = t1 - t0;
        averageTimeToExecute += timeToExecute;
        console.log(`AC took ${timeToExecute}ms to run for test #${index}`);

        if (pitch == null) throw new Error("No frequency detected");
        const diff = Math.abs(pitch - Number(hz));
        if (diff > 10) {
          console.log(
            `AC Too large an error - detected ${type} wave at ${hz} as ${pitch} hz`
          );
        } else {
          console.log(
            `AC Error was small - pitch detected successfully for ${type} wave at ${hz} as ${pitch} hz`
          );
        }
      });
    });
    averageTimeToExecute /= pitchSamplesLabels.length;
    console.log(`AC average time to execute is: ${averageTimeToExecute}`);
  };
  let testYin = async () => {
    let yin = await detectors.YIN().then((detector) => {
      if (detector) {
        console.log("Running test for YIN");
        let pitchSamplesLabels = Object.keys(pitchSamples);
        let averageTimeToExecute = 0;
        Object.values(pitchSamples).forEach((sound, index) => {
          const [hz, type] = pitchSamplesLabels[index].split("_");
          console.log(`Running test #${index} on ${type} wave at ${hz} hz`);
          sound.then((buffer) => {
            let decoded = decode(buffer);
            let t0 = performance.now();
            let pitch = detector(decoded, 0.1, 44100, 0.1);
            let t1 = performance.now();
            let timeToExecute = t1 - t0;
            averageTimeToExecute += timeToExecute;
            console.log(
              `Yin took ${timeToExecute}ms to run for test #${index}`
            );
            if (pitch == null) throw new Error("No frequency detected");
            const diff = Math.abs(pitch - Number(hz));
            if (diff > 10) {
              console.log(
                `Yin Too large an error - detected ${type} wave at ${hz} as ${pitch} hz`
              );
            } else {
              console.log(
                `Yin Error was small - pitch detected successfully for ${type} wave at ${hz} as ${pitch} hz`
              );
            }
          });
        });
        averageTimeToExecute /= pitchSamplesLabels.length;
        console.log(`Yin average time to execute is: ${averageTimeToExecute}`);
      }
    });
  };
  React.useEffect(() => {
    testYin().then(() => {
      // testAutocorellation();
    });
  }, []);

  return null;
};

export default PerformanceComparison;

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
