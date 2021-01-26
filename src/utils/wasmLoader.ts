import { instantiateStreaming } from "@assemblyscript/loader";
import ModuleTypes from "../types/asTypes";

export const loadWasm = instantiateStreaming<typeof ModuleTypes>(
  fetch("optimized.wasm")
).then(({ exports }) =>
  Object.assign({}, exports, {
    YinDetector: (
      arrayValues: Float32Array,
      setAcceptanceThreshold: number,
      sampleRate: number,
      probabilityThreshold: number
    ) => {
      const pInput = exports.__retain(
        exports.__newArray(exports.Float32AudioBuffer_ID, arrayValues)
      );
      const pOutput = exports.getPitch(
        pInput,
        setAcceptanceThreshold,
        sampleRate,
        probabilityThreshold,
        arrayValues.length
      );
      exports.__release(pInput);
      return pOutput;
    },
  })
);
// .catch((e) => {
//   console.log(e);
// });
