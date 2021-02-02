import * as React from "react";
import CircularSlider from "../../../common/containers/CircularSlider";
import styled from "styled-components";
import MetronomeMeasureButton from "./MetronomeMeasureButtons";
import { IMetronomeProps } from "../../../types/Interfaces";

let Container = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
  padding-top: 20%;
  justify-content: space-around;
  align-items: center;
  margin-top: -150px;
`;

const Metronome: React.FunctionComponent<IMetronomeProps> = ({
  beatsPerMeasure,
  handleSliderInputChange,
  primaryColor,
  setBeatsPerMeasure,
  tempo,
  play,
  setNoteType,
  handleTapTempo,
  tapTempoActive,
  handleStartTapTempo,
}) => {
  return (
    <Container>
      <CircularSlider
        label="Tempo"
        labelColor={primaryColor}
        labelFontSize="0px"
        valueFontSize={"100px"}
        verticalOffset={"2rem"}
        progressColorFrom={primaryColor}
        progressColorTo={primaryColor}
        progressSize={35}
        knobColor="#777777"
        knobSize={85}
        trackColor="#96969633"
        trackSize={35}
        width={340}
        data={[...Array(261).keys()].slice(30)}
        dataIndex={tempo - 30}
        onChange={(value: string) => {
          handleSliderInputChange(parseInt(value));
        }}
      />
      <MetronomeMeasureButton
        beatsPerMeasure={beatsPerMeasure}
        setBeatsPerMeasure={setBeatsPerMeasure}
        playMetronome={play}
        setNoteType={setNoteType}
      />
      <button
        onMouseDown={() => handleTapTempo("press")}
        onMouseUp={() => handleTapTempo("release")}
      >
        TAP TEMPO
      </button>
      <button
        onClick={() =>
          !tapTempoActive
            ? handleStartTapTempo("start")
            : handleStartTapTempo("stop")
        }
      >
        Toggle tap tempo on or off
      </button>
    </Container>
  );
};

export default Metronome;
