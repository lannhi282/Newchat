import React from "react";

import Header from "./Header";
import HeroSection from "./HeroSection";
import ScrollToTopButton from "./ScrollToTopButton";
import styled from "styled-components";

const Welcome = () => {
  return (
    <Wrapper>
      <Header />
      <HeroSection />
      <ScrollToTopButton />
    </Wrapper>
  );
};

export default Welcome;

const Wrapper = styled.section`
  .top-btn {
    background-color: #3180fc;
    color: white;
    width: 4rem;
    height: 4rem;
    font-size: 2.4rem;
    padding: 0.25rem;
  }
`;
