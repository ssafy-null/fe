import { ReactElement } from 'react';
import styled from 'styled-components';
import { Text, Icon } from '@atoms';
import { Tag, ProfileImage } from '@molecules';
import { useAuthState } from '@store';
import { Team } from '@utils/type';

const Wrapper = styled.div<{ isComplete: boolean }>`
  position: relative;
  box-shadow: 0 12px 20px 0 rgba(0, 0, 0, 0.15);
  padding: 20px;

  .completed-team-overlay {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    background-color: gray;
    opacity: 0.5;
  }

  ${({ isComplete }) =>
    isComplete &&
    `
    .completed-team-overlay {
      display: block;
    }
  `}

  .team-manage-button {
    display: flex;
    justify-content: flex-end;

    i {
      cursor: pointer;
    }
  }

  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;

    .team-name-container {
      grid-column: 1 / 2;
      grid-row: 1 / 2;
      margin-bottom: 20px;
    }

    .profiles-container {
      grid-column: 1 / 2;
      grid-row: 2 / 3;

      .profiles {
        padding: 0 15px 0 5px;
        .profile {
          display: inline-block;
          margin: 10px;
          text-align: center;
        }
      }
    }

    .description-container {
      grid-column: 2 / 3;
      grid-row: 1 / 3;

      .skills {
        margin-bottom: 20px;

        .skills-tags {
          margin-top: 10px;
          > div {
            display: inline-block;
            margin: 0 5px;
          }
        }
      }

      .track {
        margin-bottom: 10px;
      }
    }
  }
`;

interface TeamStatusCard {
  team: Team;
  onClickTeamManage: (team: Team) => void;
}

export default function TeamStatusCard({
  team,
  onClickTeamManage,
}: TeamStatusCard): ReactElement {
  const { user } = useAuthState();
  const currentUserIsInThisTeam =
    team.teamMembers.find((m) => m.id === user.id) || true; // TODO: 개발용으로 true 집어넣음 DEVELOP

  return (
    <Wrapper isComplete={team.completeYn !== 0}>
      <div className="grid-container">
        <div className="team-name-container">
          <Text text="팀 이름" color="gray" />
          <Text text={team.name} fontSetting="n20m" />
        </div>

        <div className="profiles-container">
          <Text text="팀 구성" color="gray" />
          <div className="profiles">
            {team.teamMembers.map((item) => (
              <div className="profile" key={item.id}>
                <ProfileImage size={80} src={item.img ? item.img : undefined} />
                {item.id === team.leaderId ? (
                  <Text text={item.name + '(팀장)'} />
                ) : (
                  <Text text={item.name} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="description-container">
          <div className="track">
            <Text text="트랙" color="gray" />
            <Text text={team.trackName} fontSetting="n20m" />
          </div>
          <div className="skills">
            <Text text="기술" color="gray" />
            <div className="skills-tags">
              {team.skills.map((item) => {
                return (
                  <Tag
                    text={item.codeName}
                    key={item.code}
                    backgroundColor={item.backgroundColor}
                    color={item.color}
                  />
                );
              })}
            </div>
          </div>
          <div className="description">
            <Text text="소개" color="gray" />
            <Text text={team.introduce} isLineBreak fontSetting="n18m" />
          </div>
        </div>
      </div>

      <div className="completed-team-overlay"></div>
      {currentUserIsInThisTeam && (
        <div className="team-manage-button">
          <Icon iconName="settings" func={() => onClickTeamManage(team)} />
        </div>
      )}
    </Wrapper>
  );
}
