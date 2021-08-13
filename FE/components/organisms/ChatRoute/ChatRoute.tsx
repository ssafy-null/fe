import {
  ReactElement,
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { OptionsType } from 'react-select';

import {
  useAuthState,
  useAppDispatch,
  useModalState,
  setChatOpen,
  displayModal,
  removeModal,
} from '@store';
import useSockStomp from '@hooks/useSockStomp';

import { ChatList, ChatRoom, Modal } from '@organisms';
import {
  UserSelectChatAutoComplete,
  Button,
  DropdownMenu,
  Tooltip,
} from '@molecules';
import { Text, Icon } from '@atoms';
import { MODALS } from '@utils/constants';

import { getUserHasTeam } from '@repository/teamRepository';
import {
  getChatLists,
  postCreateRoom,
  postInviteRoom,
  postModifyRoomName,
  getRoomUserList,
  postLeaveChatRoom,
} from '@repository/chatRepository';
import { MemberOption } from '@utils/type';

const Wrapper = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;

  width: 400px;
  height: 600px;
  max-height: 70%;

  border-radius: 10px;
  box-shadow: 0 12px 20px 0 rgba(0, 0, 0, 0.15);

  background-color: white;

  z-index: 12;

  .header {
    ${({ theme: { flexRow } }) => flexRow('space-between')}

    padding: 0 10px;

    width: calc(100% - 20px);

    height: 40px;
    background-color: ${({
      theme: {
        colors: { daangn },
      },
    }) => daangn};

    border-radius: 10px 10px 0px 0px;

    > a {
      > div {
        ${({ theme: { flexRow } }) => flexRow()}
      }
    }

    i {
      cursor: pointer;
    }

    .header-title {
      ${({ theme: { flexRow } }) => flexRow()}
      cursor: pointer;
      user-select: none;
      width: 200px;
    }

    .fixed-one {
      position: absolute;
      right: 40px;
    }

    .fixed-two {
      position: absolute;
      right: 70px;
    }
  }

  div {
    ::-webkit-scrollbar {
      background-color: white;
      width: 5px;
    }
    ::-webkit-scrollbar-track {
      background-color: white;
    }
    ::-webkit-scrollbar-thumb {
      background-color: ${({
        theme: {
          colors: { gray },
        },
      }) => gray};
    }
  }
`;

const CHAT_LIST = 0;
const CHAT_ROOM = 1;

export default function ChatRoute(): ReactElement {
  const dispatch = useAppDispatch();
  const isShow = useModalState();

  const {
    user: { id, projectCode },
  } = useAuthState();

  const [room_id, setRoomId] = useState<number>(0);
  const [roomName, setRoomName] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<OptionsType<MemberOption>>(
    [],
  );
  const [userList, setUserList] = useState([]);
  const [roomUserList, setRoomUserList] = useState([]);

  const [route, setRoute] = useState(CHAT_LIST);

  const [isLeader, setIsLeader] = useState(false);
  const [teamId, setTeamId] = useState(0);

  const [opponentId, setOpponentId] = useState(0);

  const {
    handleSendMessage,
    handleSendRtcLink,
    handleSendInvitation,
    handleGetChatRoomMessages,
    messageList,
    setMessageList,
    isConnectStomp,
  } = useSockStomp({
    room_id,
  });

  const wrapperRef: any = useRef<HTMLInputElement>(null);
  const editRef: any = useRef<string>('');
  const modalRef: any = useRef(null);

  useEffect(() => {
    modalRef.current = Object.keys(isShow).find((each) => isShow[each]);
  });

  function handleClickOutside({ target }: ChangeEvent<HTMLInputElement>) {
    if (!wrapperRef.current?.contains(target) && !modalRef.current) {
      dispatch(setChatOpen({ isChatOpen: false }));
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () =>
      document.removeEventListener('click', handleClickOutside, true);
  }, []);

  useEffect(() => {
    (async () => {
      const project =
        projectCode && projectCode.length > 0
          ? projectCode[projectCode.length - 1]
          : 101;

      const {
        data: { data },
      } = await getUserHasTeam({
        userId: id,
        project: { code: project },
      });

      if (data.hasTeam) {
        if (data.team.leaderId === id) {
          setTeamId(data.team.id);
          setIsLeader(true);
        }
      }
    })();
  }, [roomUserList]);

  useEffect(() => {
    if (room_id !== 0) {
      (async () => {
        const {
          data: { data },
        } = await getRoomUserList(room_id);
        setOpponentId(data.filter(({ user_id }) => id !== user_id)[0].user_id);
      })();
    }
  }, [room_id]);

  const handleToChatRoom = async (id: number, room_name: string) => {
    await setRoomId(id);
    setRoomName(room_name);
    setRoute(CHAT_ROOM);
    const {
      data: { data },
    } = await getRoomUserList(id);
    setRoomUserList(data);
  };

  const handleClickSend = async (msg: string) => {
    await handleSendMessage(msg);
  };

  const handleChangeUserSelect = async (
    selected: OptionsType<MemberOption> | null,
  ) => {
    if (selected) {
      setSelectedUser(selected);
    }
  };

  const handleCreateOrInviteRoom = async () => {
    if (selectedUser && selectedUser.length > 0) {
      try {
        if (route === CHAT_LIST) {
          const {
            data: {
              data: { chat_room_id, room_name },
            },
          } = await postCreateRoom({
            userids: [
              id,
              ...selectedUser.reduce((acc, cur) => [...acc, cur.user_id], []),
            ],
          });

          handleToChatRoom(chat_room_id, room_name);
          return handleGetChatLists();
        }

        return await postInviteRoom({
          room_id,
          userids: [
            ...selectedUser.reduce((acc, cur) => [...acc, cur.user_id], []),
          ],
        });
      } catch (error) {
        return console.error(error);
      }
    }
    dispatch(
      displayModal({
        modalName: MODALS.ALERT_MODAL,
        content: '유저를 선택해주세요!.',
      }),
    );
  };

  const handleGetChatLists = async () => {
    try {
      const {
        data: { data },
      } = await getChatLists(id);

      setUserList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeTitle = async () => {
    if (editRef.current.value.length > 0) {
      try {
        await postModifyRoomName({
          room_id,
          title: editRef.current.value,
        });
        setRoomName(editRef.current.value);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <Modal modalName={MODALS.HOC_MODAL}>
        <div className="upper">
          <UserSelectChatAutoComplete
            handleChangeUserSelect={handleChangeUserSelect}
            roomId={room_id}
          />
          <div className="button-container">
            <Button
              title={route === CHAT_LIST ? '생성' : '초대'}
              width="100%"
              func={() => {
                handleCreateOrInviteRoom();
                dispatch(removeModal({ modalName: MODALS.HOC_MODAL }));
              }}
            />
          </div>
        </div>
      </Modal>
      <Wrapper
        initial="pageInitial"
        animate="pageAnimate"
        variants={{
          pageInitial: {
            opacity: 0,
          },
          pageAnimate: {
            opacity: 1,
          },
        }}
        ref={wrapperRef}
      >
        <div className="header">
          {route === CHAT_LIST ? (
            <Text text="채팅 목록" fontSetting="n16b" color="white" />
          ) : (
            <>
              <Icon
                iconName="arrow_back"
                color="white"
                func={() => setRoute(CHAT_LIST)}
              />
              <>
                <Tooltip>
                  <>
                    <div className="content">
                      <input
                        ref={editRef}
                        type="text"
                        placeholder="변경할 방 제목을 입력해주세요"
                        onKeyPress={(e: KeyboardEvent<HTMLDivElement>) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleChangeTitle();
                          }
                        }}
                      />
                      <button type="button" onClick={handleChangeTitle}>
                        EDIT
                      </button>
                    </div>
                    <Text
                      className="header-title"
                      text={roomName}
                      fontSetting="n16b"
                      color="white"
                    />
                  </>
                </Tooltip>
              </>

              <div className="fixed-two">
                <DropdownMenu roomUserList={roomUserList}>
                  <Icon iconName="supervisor_account" color="white" size="30" />
                </DropdownMenu>
              </div>
            </>
          )}
          <div className="fixed-one">
            <DropdownMenu
              items={
                route === CHAT_LIST
                  ? [
                      {
                        id: 1,
                        title: '방 만들기',
                        func: () =>
                          dispatch(
                            displayModal({ modalName: MODALS.HOC_MODAL }),
                          ),
                      },
                    ]
                  : [
                      {
                        id: 1,
                        title:
                          roomUserList.length === 2 ? '팀 초대' : '단톡 초대',
                        func: () =>
                          roomUserList.length === 2
                            ? isLeader
                              ? handleSendInvitation(teamId, id, opponentId)
                              : dispatch(
                                  displayModal({
                                    modalName: MODALS.ALERT_MODAL,
                                    content: '팀장만 초대 가능합니다.',
                                  }),
                                )
                            : dispatch(
                                displayModal({ modalName: MODALS.HOC_MODAL }),
                              ),
                      },
                      {
                        id: 2,
                        title: '전화 걸기',
                        func: () => handleSendRtcLink(id, room_id, true),
                      },
                      {
                        id: 3,
                        title: '방 나가기',
                        func: () => {
                          postLeaveChatRoom({ room_id, user_id: id });
                          setRoute(CHAT_LIST);
                        },
                      },
                    ]
              }
            >
              <Icon iconName="menu" color="white" size="30" />
            </DropdownMenu>
          </div>

          <Icon
            iconName="close"
            color="white"
            func={() => dispatch(setChatOpen({ isChatOpen: false }))}
          />
        </div>
        {
          {
            [CHAT_LIST]: (
              <ChatList
                handleToChatRoom={handleToChatRoom}
                handleGetChatLists={handleGetChatLists}
                userList={userList}
              />
            ),
            [CHAT_ROOM]: (
              <ChatRoom
                isConnectStomp={isConnectStomp}
                messageList={messageList}
                setMessageList={setMessageList}
                handleGetChatRoomMessages={handleGetChatRoomMessages}
                setRoomId={setRoomId}
                handleClickSend={handleClickSend}
                roomId={room_id}
              />
            ),
          }[route]
        }
      </Wrapper>
    </>
  );
}
