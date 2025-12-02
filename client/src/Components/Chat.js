import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import styled from "styled-components";
import ChatMenu from "./ChatMenu";
import ChatWindow from "./ChatWindow";
import SideMenu from "./SideMenu";
import { ToastContainer } from "react-toastify";
import NetworkError from "./modal/NetworkError";
import { useSelector, useDispatch } from "react-redux";
import {
  setUserOnline,
  setUserOffline,
  fetchOnlineUsers,
} from "../Redux/Reducer/OnlineUsers/onlineUsers.action";
import io from "socket.io-client";

const ENDPOINT = process.env.REACT_APP_SERVER_ACCESS_BASE_URL;
let socket;

const Chat = () => {
  const dispatch = useDispatch();
  const isNetworkError = useSelector(
    (globalstate) => globalstate.message.NetworkError
  );
  const user = useSelector((globalstate) => globalstate.user.userDetails);

  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT);
      socket.emit("setup", user);

      // Fetch initial online users
      dispatch(fetchOnlineUsers());

      // Listen for user online/offline events
      socket.on("user online", (userId) => {
        dispatch(setUserOnline(userId));
      });

      socket.on("user offline", (userId) => {
        dispatch(setUserOffline(userId));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, dispatch]);

  return (
    <NetworkError>
      <ToastContainer />
      <Wrapper className="flex justify-start w-screen">
        <SideMenu />
        <ChatMenu />
        <ChatWindow />
      </Wrapper>
    </NetworkError>
  );
};
const Wrapper = styled.section`
  overflow: hidden;
  height: 100vh;
  transition: all 0.5s;
`;

export default Chat;
