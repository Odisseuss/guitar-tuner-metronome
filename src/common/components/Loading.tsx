import * as React from "react";
import styled from "styled-components";

export interface LoadingProps {}

let StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
let StyledText = styled.h1`
  font-size: 2.5rem;
`;
const Loading: React.FunctionComponent<LoadingProps> = () => {
  return (
    <StyledContainer>
      <StyledText>Loading...</StyledText>
    </StyledContainer>
  );
};

export default Loading;
