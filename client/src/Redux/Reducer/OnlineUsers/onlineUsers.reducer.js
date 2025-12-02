import {
  SET_ONLINE_USERS,
  USER_ONLINE,
  USER_OFFLINE,
} from "./onlineUsers.type";

const initialState = {
  onlineUsers: [],
};

const onlineUsersReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: action.payload,
      };
    case USER_ONLINE:
      if (!state.onlineUsers.includes(action.payload)) {
        return {
          ...state,
          onlineUsers: [...state.onlineUsers, action.payload],
        };
      }
      return state;
    case USER_OFFLINE:
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter((id) => id !== action.payload),
      };
    default:
      return state;
  }
};

export default onlineUsersReducer;
