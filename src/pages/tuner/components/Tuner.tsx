import React from "react";
import styled from "styled-components";
import { ColorScheme } from "../../../types/colors";
import { CurrentStringData, SVGProps } from "../../../types/Interfaces";
import { ReactComponent as Wave } from "../../../icons/Wave.svg";
import Ruler from "./Ruler";
import StringBeingTuned from "./StringBeingTuned";
import TuningSelectionButtons from "./TuningSelectionButtons";

let SVGContainer = styled.div`
  width: 100%;
  height: 45%;
  position: absolute;
  bottom: 0;
`;
let StyledWaveSvg = styled(Wave)<SVGProps>`
  width: 100%;
  height: 100%;
  position: absolute;
  max-height: 373px;
  --color-1: ${(props) => props.color_1};
  --color-2: ${(props) => props.color_2};
  filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.15));
`;
interface TunerProps {
  handleTuningSelection: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    tuning: string
  ) => void;
  startOscillator: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  startLiveInput: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  currentStringBeingTuned: CurrentStringData;
  currentColors: ColorScheme;
  frequency: number;
  tuningIndication: string;
  rulerDivs: JSX.Element[];
  timeToCompute: number;
  rulerTranslate: number;
}
const Tuner: React.FunctionComponent<TunerProps> = ({
  handleTuningSelection,
  startLiveInput,
  startOscillator,
  currentStringBeingTuned,
  currentColors,
  frequency,
  rulerDivs,
  rulerTranslate,
  tuningIndication,
  timeToCompute,
}: TunerProps) => {
  return (
    <div style={{ height: "90%", width: "100%", position: "relative" }}>
      <TuningSelectionButtons onClick={handleTuningSelection} />
      <button onClick={startOscillator}>Oscillator</button>
      <button onClick={startLiveInput}>Live Input</button>
      <StringBeingTuned
        note={currentStringBeingTuned.letter}
        frequency={currentStringBeingTuned.frequency}
        noteProps={{ color: currentColors.primary }}
      />

      <SVGContainer>
        <h1
          style={{
            position: "absolute",
            width: "100%",
            top: "45%",
            fontWeight: 400,
            fontSize: 18,
            textAlign: "center",
            zIndex: 100,
            color: currentColors.primary,
          }}
        >
          {frequency}Hz
        </h1>
        <h1
          style={{
            position: "absolute",
            width: "100%",
            top: "50%",
            fontWeight: 400,
            fontSize: 18,
            textAlign: "center",
            zIndex: 100,
            color: currentColors.primary,
          }}
        >
          {tuningIndication}
        </h1>
        <h1
          style={{
            position: "absolute",
            width: "100%",
            top: "55%",
            fontWeight: 400,
            fontSize: 18,
            textAlign: "center",
            zIndex: 100,
            color: currentColors.primary,
          }}
        >
          {timeToCompute}
        </h1>
        {/* <PerformanceComparison></PerformanceComparison> */}
        <Ruler
          rulerGradings={rulerDivs}
          gradingColors={currentColors.primary}
          rulerTranslate={rulerTranslate}
        />
        <StyledWaveSvg
          color_1={currentColors.gradient_lighter}
          color_2={currentColors.gradient_darker}
          style={{ position: "absolute", bottom: 0, left: 0 }}
        />
      </SVGContainer>
    </div>
  );
};

export default Tuner;
