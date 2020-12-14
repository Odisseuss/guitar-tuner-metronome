import * as React from "react";
import styled from "styled-components";

export interface StringBeingTunedProps {
  note: string;
  frequency: number;
  noteProps: NoteProps;
}
export interface NoteProps {
  color?: string;
}
let StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
let Note = styled.h1<NoteProps>`
  margin: 0;
  color: ${(props) => props.color};
  font-size: 144px;
  line-height: 144px;
  font-weight: 400;
`;
let Frequency = styled.p`
  margin: 0;
  margin-top: 20px;
  color: #777777;
  font-size: 18px;
  font-weight: 400;
`;
// let Tunings = ["Drop D", "Double drop D", "Open E", "Open G", "Open A"];
const StringBeingTuned: React.FunctionComponent<StringBeingTunedProps> = (
  props
) => {
  return (
    <StyledContainer>
      <Note color={props.noteProps.color}>{props.note}</Note>
      <Frequency>{props.frequency}Hz</Frequency>
    </StyledContainer>
  );
};

export default StringBeingTuned;
