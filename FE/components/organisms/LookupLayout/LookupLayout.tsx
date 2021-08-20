import { ReactElement, JSXElementConstructor } from 'react';
import styled from 'styled-components';
import { respondTo } from '@styles/respondTo';

interface LookupLayoutProps {
  children: ReactElement<any, string | JSXElementConstructor<any>> | any;
  showTeamCreateBtn: boolean;
  filterPosition?: boolean;
}

const Wrapper = styled.div<{
  showTeamCreateBtn: boolean;
  filterPosition?: boolean;
}>`
  display: grid;
  grid-template-columns: 250px auto;
  grid-template-rows: auto;
  gap: 20px;

  ${respondTo.mobile`
    ${({ theme: { flexCol } }) => flexCol()}
    width: 100%;
  `}

  .filter-container {
    position: sticky;
    top: ${({ filterPosition }) => (filterPosition ? '130px' : '30px')};
    height: fit-content;
    border-radius: 14px;
    background-color: white;
    box-shadow: 2px 4px 12px rgb(0 0 0 / 8%);
    ${respondTo.mobile`
      display: none;
    `}
    margin-bottom: 30px;
  }

  .sort-container {
    display: flex;
    align-items: center;
    gap: 10px;
    .sort-icon {
      flex: 1;
      transform-origin: center;
      transition: all 0.3s ease-in;
    }
    .rotated {
      transform: rotate(0.5turn);
    }
    .sort-select {
      flex: 9;
    }
  }

  .team-status-header {
    display: grid;
    ${({ showTeamCreateBtn }) =>
      showTeamCreateBtn
        ? 'grid-template-columns: auto 150px 100px;'
        : 'grid-template-columns: auto 150px;'}
    align-items: center;
    justify-items: center;
    gap: 10px;

    border-radius: 14px;
    background-color: white;
    box-shadow: 2px 4px 12px rgb(0 0 0 / 8%);

    > div {
      width: 100%;
    }
    padding: 15px 20px;
  }

  .team-status-list-container {
    > div {
      margin-bottom: 20px;
    }

    .no-list {
      text-align: center;
    }

    .text-area {
      border: none;
      background-color: transparent;
      resize: none;
      width: 100%;
      min-height: 123px;
      height: 100%;
      ${({
        theme: {
          font: { n16m },
        },
      }) => n16m}
    }
  }
`;

export default function LookupLayout({
  children,
  showTeamCreateBtn,
  filterPosition,
}: LookupLayoutProps): ReactElement {
  return (
    <Wrapper
      showTeamCreateBtn={showTeamCreateBtn}
      filterPosition={filterPosition}
    >
      {children}
    </Wrapper>
  );
}
