export const Float32AudioBuffer_ID = idof<Float32Array>();

export function getPitch(
  float32AudioBuffer: Float32Array,
  threshold: f32, //0.15
  sampleRate: i32,
  probabilityThreshold: f32,
  bufferSize: i32
): f32 {
  // Initialization
  var halfBufferSize = bufferSize / 2;
  var yinBuffer = new Float32Array(halfBufferSize);
  var tauEstimate = -1;
  var pitchInHz: f32 = -1;
  var estimationProbability = 0.0;
  for (var i = 1; i < halfBufferSize; i++) {
    yinBuffer[i] = 0;
  }

  // Difference function as described in step 2 of YIN paper
  var index: i32;
  var tau: i32;
  var delta: f32;
  for (tau = 0; tau < halfBufferSize; tau++) {
    for (index = 0; index < halfBufferSize; index++) {
      delta =
        unchecked(float32AudioBuffer[index]) -
        unchecked(float32AudioBuffer[index + tau]);
      yinBuffer[tau] += delta * delta;
    }
  }

  // Cumulative mean normalized difference
  var runningSum: f32 = 0.0;
  yinBuffer[0] = 1;
  for (tau = 1; tau < halfBufferSize; tau++) {
    runningSum += unchecked(yinBuffer[tau]);
    yinBuffer[tau] *= f32(tau) / runningSum;
  }

  // Compute absolute threshold
  for (tau = 2; tau < halfBufferSize; tau++) {
    if (unchecked(yinBuffer[tau]) < threshold) {
      while (
        tau + 1 < halfBufferSize &&
        unchecked(yinBuffer[tau + 1]) < unchecked(yinBuffer[tau])
      ) {
        tau++;
      }
      // found tau, exit loop and return
      // store the probability
      // From the YIN paper: The threshold determines the list of
      // candidates admitted to the set, and can be interpreted as the
      // proportion of aperiodic power tolerated
      // within a ëëperiodicíí signal.
      //
      estimationProbability = 1 - unchecked(yinBuffer[tau]);
      break;
    }
  }
  // if no pitch found, tau => -1
  if (tau === halfBufferSize || unchecked(yinBuffer[tau]) >= threshold) {
    tau = -1;
    estimationProbability = 0;
  }
  if (estimationProbability < probabilityThreshold) {
    return -1;
  }

  tauEstimate = tau;

  // Perform parabolic interpolation
  if (tauEstimate !== -1) {
    var betterTau: f32;
    var x0: i32;
    var x2: i32;
    if (tauEstimate < 1) {
      x0 = tauEstimate;
    } else {
      x0 = tauEstimate - 1;
    }
    if (tauEstimate + 1 < halfBufferSize) {
      x2 = tauEstimate + 1;
    } else {
      x2 = tauEstimate;
    }
    if (x0 === tauEstimate) {
      if (unchecked(yinBuffer[tauEstimate]) <= unchecked(yinBuffer[x2])) {
        betterTau = f32(tauEstimate);
      } else {
        betterTau = f32(x2);
      }
    } else if (x2 === tauEstimate) {
      if (unchecked(yinBuffer[tauEstimate]) <= unchecked(yinBuffer[x0])) {
        betterTau = f32(tauEstimate);
      } else {
        betterTau = f32(x0);
      }
    } else {
      var s0: f32, s1: f32, s2: f32;
      s0 = unchecked(yinBuffer[x0]);
      s1 = unchecked(yinBuffer[tauEstimate]);
      s2 = unchecked(yinBuffer[x2]);
      // fixed AUBIO implementation, thanks to Karl Helgason:
      // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
      betterTau = f32(tauEstimate) + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }
    pitchInHz = f32(sampleRate) / betterTau;
  }

  return pitchInHz;
}
