import * as React from "react";
// @ts-ignore
import CircularSlider from "@fseehawer/react-circular-slider";
import styled from "styled-components";
import MetronomeMeasureButton from "./MetronomeMeasureButtons";

export interface MetronomeProps {
  primaryColor: string;
}

let Container = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
  padding-top: 20%;
  justify-content: space-around;
  align-items: center;
  margin-top: -150px;
  // Remove additional styling from knob
  & div:nth-child(3) code {
    font-weight: 600;
    font-family: "Be Vietnam";
  }
  & div:nth-child(2) svg circle:first-child {
    display: none;
  }
  & div:nth-child(2) svg svg {
    display: none;
  }
`;
const Metronome: React.FunctionComponent<MetronomeProps> = ({
  primaryColor,
}) => {
  let [beatsPerMeasure, setBeatsPerMeasure] = React.useState(4);
  let [tempo, setTempo] = React.useState(0);
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
        width={"340"}
        data={[...Array(180).keys()]} //...
        dataIndex={0}
        onChange={(value: string) => {
          setTempo(parseInt(value));
        }}
      />
      <MetronomeMeasureButton
        beatsPerMeasure={beatsPerMeasure}
        setBeatsPerMeasure={setBeatsPerMeasure}
      />
    </Container>
  );
};

export default Metronome;
