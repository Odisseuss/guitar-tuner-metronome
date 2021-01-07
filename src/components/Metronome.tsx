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
  justify-content: center;
  align-items: center;
  margin-top: -150px;
  & div:nth-child(3) code {
    font-weight: 600;
    font-family: "Be Vietnam";
  }
`;
const Metronome: React.FunctionComponent<MetronomeProps> = ({
  primaryColor,
}) => {
  return (
    <Container>
      <CircularSlider
        label="Tempo"
        labelColor={primaryColor}
        labelFontSize="0px"
        valueFontSize={"100px"}
        verticalOffset={"2.5rem"}
        progressColorFrom={primaryColor}
        progressColorTo={primaryColor}
        progressSize={35}
        knobColor="#777777"
        knobSize={70}
        trackColor="#96969633"
        trackSize={35}
        width={"340"}
        data={[...Array(180).keys()]} //...
        dataIndex={0}
      />
      <MetronomeMeasureButton />
    </Container>
  );
};

export default Metronome;
