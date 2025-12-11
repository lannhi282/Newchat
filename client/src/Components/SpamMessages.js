import React, { useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpamChats } from "../Redux/Reducer/Chat/chat.action";
import UserList from "./UserList";

const SpamMessages = () => {
  const dispatch = useDispatch();
  const spamChats = useSelector((state) => state.chat.spamChats || []);
  const user = useSelector((state) => state.user.userDetails);

  useEffect(() => {
    if (user._id) {
      dispatch(fetchSpamChats());
    }
  }, [dispatch, user._id]);

  return (
    <Wrapper>
      <div className="chat-menu p-3 p-lg-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold m-0">Spam Messages</h1>
            <p className="text-gray-400 mb-0">Messages marked as spam</p>
          </div>
        </div>
      </div>

      <div className="chat-list overflow-y-auto">
        {spamChats.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">No spam messages</p>
          </div>
        ) : (
          <UserList
            chatList={spamChats}
            chat={spamChats}
            loggedUser={user}
            isSpamTab={true}
          />
        )}
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  height: 100vh;
  overflow: hidden;

  .chat-menu {
    background-color: ${({ theme }) => theme.colors.bg.primary};
    border-bottom: 1px solid rgba(${({ theme }) => theme.colors.border}, 0.3);
  }

  .chat-list {
    height: calc(100vh - 120px);
  }

  h1 {
    color: ${({ theme }) => theme.colors.heading};
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export default SpamMessages;
