import * as React from "react";
import styled from "styled-components";
import { motion, useAnimation } from "framer-motion";

export interface RulerProps {
  rulerGradings: JSX.Element[];
  gradingColors: string;
  rulerTranslate: number;
}

let RulerContainer = styled.div`
  z-index: 99999;
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
`;

const Ruler: React.FunctionComponent<RulerProps> = ({
  rulerGradings,
  gradingColors,
  rulerTranslate,
}) => {
  const controls = useAnimation();
  React.useEffect(() => {
    controls.start({
      translateX: rulerTranslate,
      transition: {
        duration: 0.15,
      },
    });
  }, [rulerTranslate, controls]);
  return (
    <RulerContainer>
      {rulerGradings}
      <motion.div
        animate={controls}
        style={{
          position: "absolute",
          // transform: `translateX(${rulerTranslate}px)`,
          width: "3px",
          height: 110,
          backgroundColor: gradingColors,
        }}
      ></motion.div>
    </RulerContainer>
  );
};

export default Ruler;
