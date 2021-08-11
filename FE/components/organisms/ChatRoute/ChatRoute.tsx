import { ReactElement, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { OptionsType } from 'react-select';
import ReactTooltip from 'react-tooltip';

import {
  useAuthState,
  useAppDispatch,
  setChatOpen,
  displayModal,
  removeModal,
} from '@store';
import useSockStomp from '@hooks/useSockStomp';

import { ChatList, ChatRoom, Modal } from '@organisms';
import { UserSelectChatAutoComplete, Button, DropdownMenu } from '@molecules';
import { Text, Icon } from '@atoms';
import { MODALS } from '@utils/constants';

import {
  getChatLists,
  postCreateRoom,
  postInviteRoom,
  postModifyRoomName,
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

    .customTheme {
      box-shadow: 0 6px 12px 0 rgba(4, 4, 161, 0.04);
    }

    .header-title {
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

const Form = styled.form`
  ${({ theme: { flexRow } }) => flexRow()}
  input {
    height: 100%;
  }

  button {
    height: 100%;
  }
`;

const CHAT_LIST = 0;
const CHAT_ROOM = 1;

export default function ChatRoute(): ReactElement {
  const dispatch = useAppDispatch();
  const {
    user: { id },
  } = useAuthState();

  const [room_id, setRoomId] = useState<number>(0);
  const [roomName, setRoomName] = useState<string>('');
  const [selectedUser, setSelectedUser] =
    useState<OptionsType<MemberOption> | null>();
  const [userList, setUserList] = useState([]);

  const [route, setRoute] = useState(CHAT_LIST);

  const [isEdit, setIsEdit] = useState(!IS_EDIT);

  const {
    handleSendMessage,
    handleSendRtcLink,
    messageList,
    setMessageList,
    isConnectStomp,
  } = useSockStomp({
    room_id,
  });

  const wrapperRef: any = useRef<HTMLInputElement>(null);
  const editRef: any = useRef<string>('');

  // function handleClickOutside({ target }: ChangeEvent<HTMLInputElement>) {
  //   if (!wrapperRef.current?.contains(target)) {
  //     dispatch(setChatOpen({ isChatOpen: false }));
  //   }
  // }

  // useEffect(() => {
  //   document.addEventListener('click', handleClickOutside, true);
  //   return () =>
  //     document.removeEventListener('click', handleClickOutside, true);
  // }, []);

  const handleToChatRoom = async (id: number, room_name: string) => {
    await setRoomId(id);
    setRoomName(room_name);
    setRoute(CHAT_ROOM);
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
                <ReactTooltip
                  className="customTheme"
                  id="clickme"
                  place="right"
                  effect="solid"
                  clickable={true}
                  arrowColor="white"
                  backgroundColor="white"
                >
                  <Form
                    onSubmit={async (e) => {
                      e.preventDefault();

                      try {
                        await postModifyRoomName({
                          room_id,
                          title: editRef.current.value,
                        });
                        setRoomName(editRef.current.value);
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                  >
                    <input
                      ref={editRef}
                      type="text"
                      placeholder="변경할 방 제목을 입력해주세요"
                    />
                    <button type="submit">EDIT</button>
                  </Form>
                </ReactTooltip>
                <a data-tip data-for="clickme" data-event="click">
                <Text
                  className="header-title"
                  text={roomName}
                  fontSetting="n16b"
                  color="white"
                />
                </a>
              </>

              <div className="fixed-two">
                <Icon
                  iconName="support_agent"
                  color="white"
                  size="30"
                  func={() => handleSendRtcLink(id, room_id, true)}
                />
              </div>
            </>
          )}
          <div className="fixed-one">
            <Icon
              iconName="person_add"
              color="white"
              size="30"
              func={() =>
                dispatch(displayModal({ modalName: MODALS.HOC_MODAL }))
              }
            />
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
