import React, { useEffect, useState, Fragment } from "react";
import { ImBlocked, ImExit } from "react-icons/im";
import { CgProfile } from "react-icons/cg";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";

import { Menu, Transition } from "@headlessui/react";
import UserProfile from "./SlideMenu/UserProfile";
import { MdFavorite } from "react-icons/md";
import { toast } from "react-toastify";
import {
  deleteChatAction,
  clearSelectChatAction,
} from "../Redux/Reducer/Chat/chat.action";

const Dropdown = (props) => {
  const [sender, setSender] = useState();
  const dispatch = useDispatch();
  const senderUser = useSelector(
    (globalState) => globalState.chat.selectedChat
  );

  // const handleClickMarkAsFavourites = () => {
  //   toast.success("We are working this feature. Available Soon", {
  //     position: "top-right",
  //     autoClose: 1000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //     theme: "light",
  //   });
  // };
  const handleClickDeleteChat = async () => {
    if (!senderUser?._id) {
      toast.error("No chat selected", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    // Thông báo khác nhau cho nhóm và chat 1-1
    const confirmMessage = senderUser.isGroupChat
      ? "Clear all chat history? You will still remain in the group and receive new messages."
      : "Delete this chat? It will be removed from your chat list.";

    if (window.confirm(confirmMessage)) {
      try {
        await dispatch(deleteChatAction(senderUser._id));

        if (senderUser.isGroupChat) {
          // Nhóm: chỉ xóa lịch sử, không clear selected chat
          toast.success("Chat history cleared", {
            position: "top-right",
            autoClose: 2000,
          });
          // Reload messages để cập nhật
          window.location.reload();
        } else {
          // Chat 1-1: xóa và clear selected
          await dispatch(clearSelectChatAction());
          toast.success("Chat deleted successfully", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      } catch (error) {
        toast.error("Failed to delete chat", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    }
  };
  const handleClickLeaveGroup = () => {
    toast.success("We are working this feature. Available Soon", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };
  useEffect(() => {
    setSender(senderUser);
  }, [senderUser]);
  return (
    <>
      <Menu>
        <Menu.Button className="btn three-dot-btn">
          <BiDotsVerticalRounded />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="dropdown-menu absolute py-4">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active
                      ? "active flex items-center justify-between"
                      : " flex items-center justify-between"
                  }`}
                  onClick={props.openModal}
                >
                  <div className="icon-btn btn-outline-primary mr-4">
                    <CgProfile className="icon inline" />
                  </div>{" "}
                  <h5 className="relative w-full text-left">view contact</h5>
                </button>
              )}
            </Menu.Item>
            {/* <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active
                      ? "active flex items-center justify-between"
                      : "flex items-center justify-between"
                  }`}
                  onClick={handleClickMarkAsFavourites}
                >
                  <div className="icon-btn btn-outline-danger mr-4">
                    <MdFavorite className="icon inline" />
                  </div>{" "}
                  <h5 className="relative w-full text-left">
                    Mark As Favourites
                  </h5>
                </button>
              )}
            </Menu.Item> */}
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active
                      ? "active flex items-center justify-between"
                      : "flex items-center justify-between"
                  }`}
                  onClick={handleClickDeleteChat}
                >
                  <div className="icon-btn btn-outline-danger mr-4">
                    <RiDeleteBin6Line className="icon inline" />
                  </div>{" "}
                  <h5 className="relative w-full text-left">Delete Chat</h5>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active
                      ? "active flex items-center justify-between"
                      : "flex items-center justify-between"
                  }`}
                  onClick={handleClickLeaveGroup}
                >
                  <div className="icon-btn btn-outline-light mr-4">
                    {/* <ImBlocked className="icon inline" /> */}
                    {sender.isGroupChat ? (
                      <ImExit className="icon inline" />
                    ) : (
                      <ImBlocked className="icon inline" />
                    )}
                  </div>{" "}
                  <h5 className="relative w-full text-left">
                    {sender.isGroupChat ? "Leave Group " : "Block"}
                  </h5>
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
};

export default Dropdown;
