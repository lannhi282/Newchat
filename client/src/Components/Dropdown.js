import React, { useEffect, useState, Fragment } from "react";
import { ImExit } from "react-icons/im";
import { CgProfile } from "react-icons/cg";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";

import { Menu, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import {
  deleteChatAction,
  clearSelectChatAction,
  removeUserFromGroup,
  fetchChats,
} from "../Redux/Reducer/Chat/chat.action";
import { clearAllMessages } from "../Redux/Reducer/Message/message.action";

const Dropdown = (props) => {
  const [sender, setSender] = useState();
  const dispatch = useDispatch();
  const senderUser = useSelector(
    (globalState) => globalState.chat.selectedChat
  );
  const loggedUser = useSelector((state) => state.user.userDetails);

  const handleClickDeleteChat = async () => {
    if (!senderUser?._id) {
      toast.error("No chat selected", {
        position: "top-right",
        autoClose: 1000,
      });
      return;
    }

    const confirmMessage = senderUser.isGroupChat
      ? "Delete all messages in this group? You will still remain in the group."
      : "Delete all messages in this chat? The conversation will remain in your list.";

    if (!window.confirm(confirmMessage)) return;

    try {
      await dispatch(deleteChatAction(senderUser._id));
      dispatch(clearAllMessages());
      dispatch(clearSelectChatAction());
      await dispatch(fetchChats());

      toast.success("Messages deleted successfully", {
        position: "top-right",
        autoClose: 1000,
      });
    } catch (error) {
      toast.error("Failed to delete messages", {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };

  const handleClickLeaveGroup = async () => {
    if (!senderUser?._id || !senderUser.isGroupChat) {
      toast.error("Please select a group chat", {
        position: "top-right",
        autoClose: 1000,
      });
      return;
    }

    if (!loggedUser?._id) {
      toast.error("User not logged in", {
        position: "top-right",
        autoClose: 1000,
      });
      return;
    }

    if (!window.confirm("Are you sure you want to leave this group?")) return;

    const loadingToast = toast.loading("Leaving group...");

    try {
      // Gọi removeUserFromGroup để rời nhóm
      await dispatch(
        removeUserFromGroup({
          chatId: senderUser._id,
          userId: loggedUser._id,
        })
      );

      dispatch(clearSelectChatAction());
      await dispatch(fetchChats());
      toast.update(loadingToast, {
        render: "Left group successfully",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    } catch (error) {
      console.error("Leave group error:", error);

      toast.update(loadingToast, {
        render: "Failed to leave group",
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
    }
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
                  <h5 className="relative w-full text-left">Delete Messages</h5>
                </button>
              )}
            </Menu.Item>

            {sender?.isGroupChat && (
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
                      <ImExit className="icon inline" />
                    </div>{" "}
                    <h5 className="relative w-full text-left">Leave Group</h5>
                  </button>
                )}
              </Menu.Item>
            )}
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
};

export default Dropdown;
