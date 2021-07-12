import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { Text } from '@atoms';

interface EachButtonProps {
  title: string;
  // TODO: 추후에 수정
  func: () => void | Function | any;
  width?: string;
}

const WrapEachButton = styled.button<{ width: string }>`
  width: ${({ width }) => width};
  height: 48px;

  bottom: 16px;
  margin: 0 auto;

  background-color: ${({
    theme: {
      colors: { black },
    },
  }) => black};

  border: none;
  border-radius: 8px;

  box-shadow: 0px 0px 4px 2px rgba(55, 53, 47, 0.4);

  color: ${({
    theme: {
      colors: { white },
    },
  }) => white};

  transition: 300ms;
  animation: 800ms ease fadeIn;
  :hover {
    opacity: 0.5;
  }
  :active {
    transform: translate(1px, 1px);
  }

  cursor: pointer;
`;

export default function Button({
  title,
  func,
  width = '200px',
}: EachButtonProps): ReactElement {
  return (
    <WrapEachButton type="button" onClick={func} width={width}>
      <Text text={title} fontSetting="n18b" />
    </WrapEachButton>
  );
}
