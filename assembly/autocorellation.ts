export const Float32AudioBuffer_ID = idof<Float32Array>();
export function autocorellation(
  float32AudioBuffer: Float32Array,
  sampleRate: i32
): f32 {
  let rms: f32 = 0;
  let size: i32 = float32AudioBuffer.length;
  for (let index = 0; index < size; index++) {
    const val: f32 = unchecked(float32AudioBuffer[index]);
    rms += val * val;
  }
  rms = f32(Math.sqrt(rms / f32(size)));
  if (rms < 0.01) return -1;

  let r1: i32 = 0,
    r2: i32 = size - 1,
    thresh: f32 = 0.2;

  for (let index = 0; index < size / 2; index++) {
    if (Math.abs(unchecked(float32AudioBuffer[index])) < thresh) {
      r1 = index;
      break;
    }
  }
  for (let index = 0; index < size / 2; index++) {
    if (Math.abs(unchecked(float32AudioBuffer[size - 1])) < thresh) {
      r2 = size - index;
      break;
    }
  }
  float32AudioBuffer = float32AudioBuffer.slice(r1, r2);
  size = float32AudioBuffer.length;

  let c = new Float32Array(size).fill(0);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - i; j++) {
      c[i] =
        unchecked(c[i]) +
        unchecked(float32AudioBuffer[j]) * unchecked(float32AudioBuffer[j + i]);
    }
  }
  let d: i32 = 0;
  while (unchecked(c[d]) > unchecked(c[d + 1])) d++;
  let maxval: f32 = -1,
    maxpos: i32 = -1;
  for (let index = d; index < size; index++) {
    if (c[index] > maxval) {
      maxval = unchecked(c[index]);
      maxpos = index;
    }
  }
  let t0: i32 = maxpos;
  let x1: f32 = unchecked(c[t0 - 1]),
    x2: f32 = unchecked(c[t0]),
    x3: f32 = unchecked(c[t0 + 1]);
  let a: f32 = (x1 + x3 - 2 * x2) / 2,
    b: f32 = (x3 - x1) / 2;
  if (a) t0 = i32(f32(t0) - b / (2 * a));
  return f32(sampleRate / t0);
}
