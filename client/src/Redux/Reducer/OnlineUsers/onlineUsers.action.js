import axios from "axios";
import {
  SET_ONLINE_USERS,
  USER_ONLINE,
  USER_OFFLINE,
} from "./onlineUsers.type";

const SERVER_ACCESS_BASE_URL = process.env.REACT_APP_SERVER_ACCESS_BASE_URL;

export const fetchOnlineUsers = () => async (dispatch) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${SERVER_ACCESS_BASE_URL}/api/user/online`,
    });
    return dispatch({
      type: SET_ONLINE_USERS,
      payload: response.data.map((user) => user._id),
    });
  } catch (error) {
    return dispatch({ type: "ERROR", payload: error });
  }
};

export const setUserOnline = (userId) => ({
  type: USER_ONLINE,
  payload: userId,
});

export const setUserOffline = (userId) => ({
  type: USER_OFFLINE,
  payload: userId,
});
