import * as React from "react";
import styled from "styled-components";
import { wrap } from "comlink";
import MetronomeLogic from "./MetronomeLogic.worker";
let ColumnContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
let RowContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
let MeasureIndicator = styled.div`
  font-weight: 500;
  font-size: 18px;
  line-height:
  color: #fff;
  border-radius: 66px;
  outline: none;
  border: none;
  padding: 10px 60px;
  background-color: rgba(150, 150, 150, 0.2);
  margin: 0px 10px;
`;
let StyledButton = styled.button`
  font-weight: 900;
  width: 10%;
  font-size: 48px;
  line-height: 48px;
  color: #fff;
  outline: none;
  border: none;
  background-color: transparent;
  margin: 0px 10px;
`;
export interface MetronomeMeasureButtonsProps {
  beatsPerMeasure: number;
  setBeatsPerMeasure: React.Dispatch<React.SetStateAction<number>>;
}

const myComlinkWorkerInstance: Worker = new MetronomeLogic();
const myComlinkWorkerApi: any = wrap(myComlinkWorkerInstance);
console.log(myComlinkWorkerApi.start);
// let points = [];
// let prev = 0;
// let prevClockTime = 0;
// let i = 0;
// myComlinkWorkerApi.start((t: number) => {
//   points.push(t - prev);
//   points.push(myComlinkWorkerApi.audioCtx.currentTime - prevClockTime);
//   prevClockTime = myComlinkWorkerApi.audioCtx.currentTime;
//   i++;
//   prev = t;
// });
console.log("[App] MyComlinkWorker instance:", myComlinkWorkerInstance);
console.log("[App] MyComlinkWorker api:", myComlinkWorkerApi);
// myComlinkWorkerApi.createMessage("John Doe").then((message: string): void => {
//   console.log("[App] MyComlinkWorker message:", message);
// });
const MetronomeMeasureButtons: React.FunctionComponent<MetronomeMeasureButtonsProps> = ({
  beatsPerMeasure,
  setBeatsPerMeasure,
}) => {
  return (
    <ColumnContainer>
      <h2 style={{ textAlign: "center" }}>Beats</h2>
      <RowContainer>
        <StyledButton
          style={{ marginTop: -10 }}
          onClick={() => {
            if (beatsPerMeasure > 1) setBeatsPerMeasure(beatsPerMeasure - 1);
          }}
        >
          -
        </StyledButton>
        <MeasureIndicator>{beatsPerMeasure}</MeasureIndicator>
        <StyledButton
          onClick={() => {
            if (beatsPerMeasure < 12) setBeatsPerMeasure(beatsPerMeasure + 1);
          }}
        >
          +
        </StyledButton>
        <StyledButton
          onClick={() => {
            if (beatsPerMeasure < 12) setBeatsPerMeasure(beatsPerMeasure + 1);
          }}
        >
          Start
        </StyledButton>
      </RowContainer>
    </ColumnContainer>
  );
};

export default MetronomeMeasureButtons;
