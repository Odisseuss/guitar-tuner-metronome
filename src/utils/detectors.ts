import { loadWasm } from "./wasmLoader";

export function autocorellation(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  let size = buffer.length;
  for (let index = 0; index < size; index++) {
    const val = buffer[index];
    rms += val * val;
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.01) return -1;

  let r1 = 0,
    r2 = size - 1,
    thresh = 0.2;

  for (let index = 0; index < size / 2; index++) {
    if (Math.abs(buffer[index]) < thresh) {
      r1 = index;
      break;
    }
  }
  for (let index = 0; index < size / 2; index++) {
    if (Math.abs(buffer[size - 1]) < thresh) {
      r2 = size - index;
      break;
    }
  }
  buffer = buffer.slice(r1, r2);
  size = buffer.length;

  let c = new Array(size).fill(0);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - i; j++) {
      c[i] = c[i] + buffer[j] * buffer[j + i];
    }
  }
  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1,
    maxpos = -1;
  for (let index = d; index < size; index++) {
    if (c[index] > maxval) {
      maxval = c[index];
      maxpos = index;
    }
  }
  let t0 = maxpos;
  let x1 = c[t0 - 1],
    x2 = c[t0],
    x3 = c[t0 + 1];
  let a = (x1 + x3 - 2 * x2) / 2,
    b = (x3 - x1) / 2;
  if (a) t0 = t0 - b / (2 * a);
  return sampleRate / t0;
}
export function YIN() {
  return loadWasm
    .then((result) => result.YinDetector)
    .catch((e) => console.log(e));
}
