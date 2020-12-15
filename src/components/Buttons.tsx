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
export interface ButtonsProps {}
let Tunings = Object.keys(tunings);
const Buttons: React.FunctionComponent<ButtonsProps> = React.memo(() => {
  let [selected, setSelected] = React.useState(0);
  let buttons = Tunings.map((tuning, index) => {
    let isSelected = index === selected;
    return (
      <Button
        key={index}
        selected={isSelected}
        onClick={() => setSelected(index)}
      >
        {tuning}
      </Button>
    );
  });
  return <StyledContainer>{buttons}</StyledContainer>;
});

export default Buttons;
