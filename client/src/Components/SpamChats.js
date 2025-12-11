import React, { useState, useEffect } from "react";
import styled from "styled-components";
import UserList from "./UserList";
import { useSelector, useDispatch } from "react-redux";
import { selectChatAction } from "../Redux/Reducer/Chat/chat.action";
import { getAllChats } from "../Redux/Reducer/Message/message.action";

const SpamChats = () => {
  const dispatch = useDispatch();
  const [selectedChat, setSelectedChat] = useState();
  const [spamChatList, setSpamChatList] = useState([]);

  const chat = useSelector((globalState) => globalState.chat.chats);
  const loggedUser = useSelector((globalState) => globalState.user.userDetails);
  const result = useSelector((globalState) => globalState.chat.selectedChat);

  useEffect(() => {
    // Filter only spam chats
    const spamChats = chat.filter((c) => c.isSpam === true);
    setSpamChatList(spamChats);
  }, [chat]);

  useEffect(() => {
    dispatch(selectChatAction(selectedChat));
    dispatch(getAllChats(selectedChat));
  }, [selectedChat, dispatch]);

  return (
    <Wrapper className="spam-chats dynamic-sidebar">
      <div className="chat-menu flex flex-wrap items-center justify-between w-full">
        <div>
          <h1 className="text-2xl m-0">Spam Messages</h1>
          <p className="text-gray-400 mb-0">Filtered spam conversations</p>
        </div>
      </div>

      <UserList
        query=""
        searchOpen={false}
        setSearchOpen={() => {}}
        chatList={spamChatList}
        chat={spamChatList}
        loggedUser={loggedUser}
        result={result}
        setSelectedChat={setSelectedChat}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  animation: fadeInLeft 1s;

  .chat-menu {
    padding: 1rem 1rem;
    background-color: ${({ theme }) => theme.colors.bg.primary};
    border-bottom: 1px solid rgba(${({ theme }) => theme.colors.border});

    h1 {
      color: ${({ theme }) => theme.colors.heading};
    }
  }
`;

export default SpamChats;
