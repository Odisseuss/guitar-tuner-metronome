import * as React from "react";
import styled from "styled-components";
import Button from "./Button";
import tunings from "../tunings";

let StyledContainer = styled.div`
  width: calc(100% - 30px);
  overflow-x: auto;
  padding-left: 15px;
  padding-top: 30px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  ::-webkit-scrollbar {
    width: 0px;
  }
`;
export interface ButtonsProps {
  onClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    tuning: string
  ) => void;
}
let Tunings = Object.keys(tunings);
const TuningSelectionButtons: React.FunctionComponent<ButtonsProps> = React.memo(
  (props) => {
    let [selected, setSelected] = React.useState(0);
    let buttons = Tunings.map((tuning, index) => {
      let isSelected = index === selected;
      return (
        <Button
          key={index}
          selected={isSelected}
          onClick={(event) => {
            props.onClick(event, tuning);
            setSelected(index);
          }}
        >
          {tuning}
        </Button>
      );
    });
    return <StyledContainer>{buttons}</StyledContainer>;
  }
);

export default TuningSelectionButtons;
