import * as React from "react";
import Tunings, { Letters, Frequencies, Tuning } from "../tunings";
import colors, { ColorScheme, ColorSchemes } from "../colors";
let functions = {
  getProperty: function getProperty<T, K extends keyof T>(
    o: T,
    propertyName: K
  ): T[K] {
    return o[propertyName];
  },
  noteFromPitch: function noteFromPitch(frequency: number) {
    let noteStrings = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    let noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return noteStrings[(Math.round(noteNum) + 69) % 12];
  },
  useAsyncEffect: function useAsyncEffect(
    fn: () => Promise<void | (() => void)>,
    dependencies?: React.DependencyList
  ) {
    return React.useEffect(() => {
      const destructorPromise = fn();
      return () => {
        destructorPromise.then((destructor) => destructor && destructor());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
  },

  determineStringBeingTuned2: function determineStringBeingTuned(
    tuning: string,
    frequency: number,
    buffer: Float32Array,
    sampleRate: number
  ) {
    // Get the frequencies and letters for the specific tuning
    let tuningFrequencies = functions.getProperty(
      functions.getProperty(
        Tunings,
        tuning as "Standard" | "Drop D" | "Double Drop D" | "DADGAD"
      ),
      "frequencies"
    );
    let tuningLetters = functions.getProperty(
      functions.getProperty(
        Tunings,
        tuning as "Standard" | "Drop D" | "Double Drop D" | "DADGAD"
      ),
      "letters"
    );
    let detectedFreq = frequency;
    let closestFreq = 0;
    let closestLetter = "-";
    let minIndex = 0;
    let minDifference = 9999;

    // This way is much better, but still needs to be improved.
    // It seems that when a sound seems to be the same note, but a different octave, the program will consider it to be the string being tuned,
    // instead of the next note
    Object.values(tuningFrequencies).map((stringFreq, index) => {
      let offset = Math.round(sampleRate / stringFreq);

      let difference = 0;
      for (let i = 0; i < buffer.length / 2; i++) {
        difference += Math.abs(buffer[i] - buffer[i + offset]);
      }
      difference /= buffer.length / 2;
      if (
        difference < minDifference &&
        detectedFreq !== 0 &&
        Math.abs(detectedFreq - stringFreq) < 70
      ) {
        minDifference = difference;
        minIndex = index;
      }
      return null;
    });
    // Get the letter note closest to the one being tuned
    closestLetter = functions.getProperty(
      tuningLetters,
      `string_${minIndex + 1}` as keyof Letters
    );
    // Get the expected frequency of the string being tuned
    closestFreq = functions.getProperty(
      tuningFrequencies,
      `string_${minIndex + 1}` as keyof Frequencies
    );
    // Get the current color scheme based on the note letter
    let currentColors = functions.getProperty(
      colors,
      closestLetter as keyof ColorSchemes
    );
    return {
      currentStringBeingTuned: {
        letter: closestLetter,
        frequency: closestFreq,
      },
      currentColors: currentColors,
    };
  },
  determineStringBeingTuned: function determineStringBeingTuned(
    tuning: string,
    frequency: number
  ) {
    // Get the frequencies and letters for the specific tuning
    let tuningFrequencies = functions.getProperty(
      functions.getProperty(
        Tunings,
        tuning as "Standard" | "Drop D" | "Double Drop D" | "DADGAD"
      ),
      "frequencies"
    );
    let tuningLetters = functions.getProperty(
      functions.getProperty(
        Tunings,
        tuning as "Standard" | "Drop D" | "Double Drop D" | "DADGAD"
      ),
      "letters"
    );
    let detectedFreq = frequency;
    let closestFreq = 0;
    let closestLetter = "-";
    let maxDifference = 9999;
    let minIndex = 0;
    // Compute the absolute differences and figure out the minimum
    // Map over the list of string frequencies
    Object.values(tuningFrequencies).map((stringFreq, index) => {
      // Compute the difference between the one detected, and the one known
      let diff = Math.abs(detectedFreq - stringFreq);
      // If the diffrence is smaller
      if (diff < maxDifference && detectedFreq !== 0) {
        // We found the new minimum
        maxDifference = diff;
        // Get the index of the minimum
        minIndex = index;
        // Update the closest letter and freq
      }
      return null;
    });
    // Get the letter note closest to the one being tuned
    closestLetter = functions.getProperty(
      tuningLetters,
      `string_${minIndex + 1}` as keyof Letters
    );
    // Get the expected frequency of the string being tuned
    closestFreq = functions.getProperty(
      tuningFrequencies,
      `string_${minIndex + 1}` as keyof Frequencies
    );
    // Get the current color scheme based on the note letter
    let currentColors = functions.getProperty(
      colors,
      closestLetter as keyof ColorSchemes
    );
    return {
      currentStringBeingTuned: {
        letter: closestLetter,
        frequency: closestFreq,
      },
      currentColors: currentColors,
    };
  },
};
export default functions;
