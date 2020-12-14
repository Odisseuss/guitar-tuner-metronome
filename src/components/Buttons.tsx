import * as React from "react";
import styled from "styled-components";
import { HTMLMotionProps, motion, useCycle } from "framer-motion";
import Button from "./Button";

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
let Tunings = ["Drop D", "Double drop D", "Open E", "Open G", "Open A"];
const Buttons: React.FunctionComponent<ButtonsProps> = () => {
  let [selected, setSelected] = React.useState(0);
  let buttons = Tunings.map((tuning, index) => (
    <Button
      key={index}
      selected={index === selected}
      onClick={() => setSelected(index)}
    >
      {tuning}
    </Button>
  ));
  return <StyledContainer>{buttons}</StyledContainer>;
};

export default Buttons;
