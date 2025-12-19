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
  spamChats: [], // Added spamChats to initialState
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
    case "MESSAGES_DELETED":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat._id === action.payload ? { ...chat, latestMessage: null } : chat
        ),
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
        chats: state.chats.filter((chat) => chat._id !== action.payload),
        selectedChat:
          state.selectedChat._id === action.payload ? {} : state.selectedChat,
      };
    case "LEAVE_GROUP":
      return {
        ...state,
        chats: state.chats.filter((chat) => chat._id !== action.payload),
        selectedChat: {},
      };

    default:
      return {
        ...state,
      };
    case "MESSAGES_DELETED":
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
  }
};

export default chatReducer;
