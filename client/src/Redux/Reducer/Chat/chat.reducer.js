// import { fetchUser } from "./chat.action";
import {
  CLEAR_SELECT_CHAT,
  CREATE_CHAT,
  CREATE_GROUP_CHAT,
  FETCH_CHATS,
  FETCH_USER,
  FETCH_USER_CLEAR,
  REMOVE_USER_FROM_GROUP,
  SELECT_CHAT,
  SHOW_USER_LOADING,
  DELETE_CHAT,
  MESSAGES_DELETED,
} from "./chat.type";

const initialState = {
  chats: [],
  newUser: [],
  createdChat: {},
  createdGroupChat: {},
  selectedChat: {},
  isUserLoading: false,
  removedUserFromGroup: {},
  spamChats: [],
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CHATS:
      return {
        ...state,
        chats: action.payload,
      };

    case FETCH_USER:
      return {
        ...state,
        newUser: action.payload,
      };

    case FETCH_USER_CLEAR:
      return {
        ...state,
        newUser: [],
      };

    // ✅ Thêm case này để cập nhật latestMessage khi có tin nhắn mới
    case "MESSAGE_RECEIVED":
      return {
        ...state,
        chats: state.chats.map((chat) => {
          // Tìm chat có ID trùng với tin nhắn mới
          if (
            chat._id === action.payload.chat._id ||
            chat._id === action.payload.chat
          ) {
            return {
              ...chat,
              latestMessage: action.payload,
            };
          }
          return chat;
        }),
        // ✅ Cập nhật selectedChat nếu đang mở chat đó
        selectedChat:
          state.selectedChat._id ===
          (action.payload.chat._id || action.payload.chat)
            ? { ...state.selectedChat, latestMessage: action.payload }
            : state.selectedChat,
      };

    // ✅ Thêm case này để cập nhật khi GỬI tin nhắn
    case "MESSAGE_SENT":
    case "UPDATE_LATEST_MESSAGE": // ✅ Thêm case này cho updateGetAllChats
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (
            chat._id === action.payload.chat._id ||
            chat._id === action.payload.chat
          ) {
            return {
              ...chat,
              latestMessage: action.payload,
            };
          }
          return chat;
        }),
        selectedChat:
          state.selectedChat._id ===
          (action.payload.chat._id || action.payload.chat)
            ? { ...state.selectedChat, latestMessage: action.payload }
            : state.selectedChat,
      };

    case MESSAGES_DELETED:
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat._id === action.payload ? { ...chat, latestMessage: null } : chat
        ),
        // ✅ Đảm bảo selectedChat cũng được update nếu đang mở
        selectedChat:
          state.selectedChat?._id === action.payload
            ? { ...state.selectedChat, latestMessage: null }
            : state.selectedChat,
      };

    case CREATE_CHAT:
      return {
        ...state,
        createdChat: action.payload,
      };

    case CREATE_GROUP_CHAT:
      return {
        ...state,
        createdGroupChat: action.payload,
      };

    case REMOVE_USER_FROM_GROUP:
      return {
        ...state,
        selectedChat: action.payload,
      };

    case SELECT_CHAT:
      return {
        ...state,
        selectedChat: action.payload,
      };

    case CLEAR_SELECT_CHAT:
      return {
        ...state,
        selectedChat: action.payload,
      };

    case SHOW_USER_LOADING:
      return {
        ...state,
        isUserLoading: action.payload,
      };

    case DELETE_CHAT:
      return {
        ...state,
        chats: state.chats.filter((c) => c._id !== action.payload),
        selectedChat: null,
      };
    case "LEAVE_GROUP":
      return {
        ...state,
        chats: state.chats.filter((chat) => chat._id !== action.payload),
        selectedChat: {},
      };

    default:
      return state;
  }
};

export default chatReducer;
