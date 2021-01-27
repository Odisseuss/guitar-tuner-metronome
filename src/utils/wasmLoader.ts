import { instantiateStreaming } from "@assemblyscript/loader";
import YinModuleTypes from "../types/yin-asTypes";
import AcModuleTypes from "../types/ac-asTypes";

export const loadYinWasm = instantiateStreaming<typeof YinModuleTypes>(
  fetch("yin-optimized.wasm")
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
export const loadACWasm = instantiateStreaming<typeof AcModuleTypes>(
  fetch("ac-optimized.wasm")
).then(({ exports }) =>
  Object.assign({}, exports, {
    ACDetector: (arrayValues: Float32Array, sampleRate: number) => {
      const pInput = exports.__retain(
        exports.__newArray(exports.Float32AudioBuffer_ID, arrayValues)
      );
      const pOutput = exports.autocorellation(pInput, sampleRate);
      exports.__release(pInput);
      return pOutput;
    },
  })
);
