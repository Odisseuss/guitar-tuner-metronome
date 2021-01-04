export const Float32AudioBuffer_ID = idof<Float32Array>();
export function YIN(
  float32AudioBuffer: Float32Array,
  threshold: f32,
  sampleRate: i32,
  probabilityThreshold: f32
): f32 {
  // Set buffer size to the highest power of two below the provided buffer's length.
  let bufferSize: i32;
  let buffer = float32AudioBuffer;
  let float32AudioBufferLength: i32 = buffer.length;
  for (bufferSize = 1; bufferSize < float32AudioBufferLength; bufferSize *= 2);
  bufferSize /= 2;

  // Set up the yinBuffer as described in step one of the YIN paper.
  const yinBufferLength: i32 = bufferSize / 2;
  const yinBuffer = new StaticArray<f32>(yinBufferLength);

  let probability: f32 = 0;
  let tau: i32;

  // Compute the difference function as described in step 2 of the YIN paper.
  for (let t = 0; t < yinBufferLength; t++) {
    yinBuffer[t] = 0;
  }
  for (let t = 1; t < yinBufferLength; t++) {
    for (let i = 0; i < yinBufferLength; i++) {
      const delta = unchecked(buffer[i]) - unchecked(buffer[i + t]);
      yinBuffer[t] += delta * delta;
    }
  }

  // Compute the cumulative mean normalized difference as described in step 3 of the paper.
  yinBuffer[0] = 1;
  yinBuffer[1] = 1;
  let runningSum: f32 = 0;
  for (let t = 1; t < yinBufferLength; t++) {
    runningSum += unchecked(yinBuffer[t]);
    yinBuffer[t] *= f32(t) / runningSum;
  }

  // Compute the absolute threshold as described in step 4 of the paper.
  // Since the first two positions in the array are 1,
  // we can start at the third position.
  for (tau = 2; tau < yinBufferLength; tau++) {
    if (unchecked(yinBuffer[tau]) < threshold) {
      while (
        tau + 1 < yinBufferLength &&
        unchecked(yinBuffer[tau + 1]) < unchecked(yinBuffer[tau])
      ) {
        tau++;
      }
      // found tau, exit loop and return
      // store the probability
      // From the YIN paper: The threshold determines the list of
      // candidates admitted to the set, and can be interpreted as the
      // proportion of aperiodic power tolerated
      // within a periodic signal.
      //
      // Since we want the periodicity and and not aperiodicity:
      // periodicity = 1 - aperiodicity
      probability = 1.0 - unchecked(yinBuffer[tau]);
      break;
    }
  }

  // if no pitch found, return null.
  if (tau === yinBufferLength || unchecked(yinBuffer[tau]) >= threshold) {
    return -1;
  }

  // If probability too low, return -1.
  if (probability < probabilityThreshold) {
    return -1;
  }

  /**
   * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
   * value using parabolic interpolation. This is needed to detect higher
   * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
   * for more background
   * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
   */
  let betterTau: f32, x0: i32, x2: i32;
  if (tau < 1) {
    x0 = tau;
  } else {
    x0 = tau - 1;
  }
  if (tau + 1 < yinBufferLength) {
    x2 = tau + 1;
  } else {
    x2 = tau;
  }
  if (x0 === tau) {
    if (unchecked(yinBuffer[tau]) <= unchecked(yinBuffer[x2])) {
      betterTau = f32(tau);
    } else {
      betterTau = f32(x2);
    }
  } else if (x2 === tau) {
    if (unchecked(yinBuffer[tau]) <= unchecked(yinBuffer[x0])) {
      betterTau = f32(tau);
    } else {
      betterTau = f32(x0);
    }
  } else {
    const s0: f32 = unchecked(yinBuffer[x0]);
    const s1: f32 = unchecked(yinBuffer[tau]);
    const s2: f32 = unchecked(yinBuffer[x2]);
    // fixed AUBIO implementation, thanks to Karl Helgason:
    // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
    betterTau = f32(tau) + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  return f32(sampleRate) / betterTau;
}
