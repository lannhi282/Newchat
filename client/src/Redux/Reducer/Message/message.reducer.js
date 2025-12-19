import {} from "./message.action";
import {
  CLEAR_ALL_MESSAGE,
  GET_ALL_MESSAGE,
  SEND_MESSAGE,
  SHOW_NETWORK_ERROR,
  SHOW_TOOGLE_LOADING,
  UPDATE_GET_ALL_MESSAGE,
  GET_SPAM_MESSAGES,
  MARK_AS_SPAM,
  MARK_AS_NOT_SPAM,
} from "./message.type";
const initialState = {
  allMessages: [],
  spamMessages: [],
  createdMessage: {},
  isLoading: false,
  sNetworkError: false,
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_MESSAGE:
      return {
        ...state,
        allMessages: action.payload,
      };

    case SEND_MESSAGE:
      return {
        ...state,
        createdMessage: action.payload,
      };

    case UPDATE_GET_ALL_MESSAGE:
      return {
        ...state,
        allMessages: [...state.allMessages, action.payload],
      };

    case "CLEAR_ALL_MESSAGES":
      return {
        ...state,
        allMessages: [],
        createdMessage: {},
      };

    case SHOW_TOOGLE_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case SHOW_NETWORK_ERROR:
      return {
        ...state,
        isNetworkError: action.payload,
      };

    case GET_SPAM_MESSAGES:
      return {
        ...state,
        spamMessages: action.payload,
      };

    case MARK_AS_SPAM:
      return {
        ...state,
        allMessages: state.allMessages.map((msg) =>
          msg._id === action.payload._id ? action.payload : msg
        ),
        spamMessages: [...state.spamMessages, action.payload],
      };

    case MARK_AS_NOT_SPAM:
      return {
        ...state,
        allMessages: state.allMessages.map((msg) =>
          msg._id === action.payload._id ? action.payload : msg
        ),
        spamMessages: state.spamMessages.filter(
          (msg) => msg._id !== action.payload._id
        ),
      };

    default:
      return {
        ...state,
      };
  }
};

export default messageReducer;
