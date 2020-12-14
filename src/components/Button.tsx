import * as React from "react";
import styled from "styled-components";
import { HTMLMotionProps, motion, useCycle } from "framer-motion";

let StyledButton = styled(motion.button)<ButtonProps>`
  font-weight: 500;
  font-size: 18px;
  color: #777777;
  border-radius: 66px;
  outline: none;
  border: none;
  padding: 10px 30px;
  background-color: transparent;
  margin: 0px 10px;
`;

export interface ButtonProps extends HTMLMotionProps<"button"> {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  selected: boolean;
}

const Button: React.FunctionComponent<ButtonProps> = (props) => {
  const [animate, cycle] = useCycle(
    {
      color: "#777777",
      backgroundColor: "rgba(150, 150, 150, 0)",
      transition: { duration: 0.35 },
    },
    {
      color: "#ffffff",
      backgroundColor: "rgba(150, 150, 150, 0.2)",
      transition: { duration: 0.35 },
    }
  );
  return (
    <StyledButton
      animate={
        props.selected
          ? {
              color: "#ffffff",
              backgroundColor: "rgba(150, 150, 150, 0.2)",
              transition: { duration: 0.35 },
            }
          : {
              color: "#777777",
              backgroundColor: "rgba(150, 150, 150, 0)",
              transition: { duration: 0.35 },
            }
      }
      onClick={props.onClick}
      selected={props.selected}
    >
      {props.children}
    </StyledButton>
  );
};

export default Button;
