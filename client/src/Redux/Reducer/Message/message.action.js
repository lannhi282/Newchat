import axios from "axios";
import {
  SEND_MESSAGE,
  GET_ALL_MESSAGE,
  UPDATE_GET_ALL_MESSAGE,
  SHOW_TOOGLE_LOADING,
  SHOW_NETWORK_ERROR,
  GET_SPAM_MESSAGES,
  MARK_AS_SPAM,
  MARK_AS_NOT_SPAM,
} from "./message.type";

const SERVER_ACCESS_BASE_URL = process.env.REACT_APP_SERVER_ACCESS_BASE_URL;

// get all messages
export const getAllChats = (selectedChat) => async (dispatch) => {
  try {
    dispatch(loadingToggleAction(true));
    const allMessage = await axios({
      method: "GET",
      url: `${SERVER_ACCESS_BASE_URL}/api/message/${selectedChat._id}`,
    });
    dispatch(loadingToggleAction(false));
    return dispatch({ type: GET_ALL_MESSAGE, payload: allMessage.data });
  } catch (error) {
    dispatch(showNetworkError(true));
    return dispatch({ type: "ERROR", payload: error });
  }
};

// updateing get all message
export const updateGetAllChats = (messageRecived) => async (dispatch) => {
  try {
    if (!messageRecived.sender) {
      return;
    }
    const updatedAllMessage = messageRecived;
    return dispatch({
      type: UPDATE_GET_ALL_MESSAGE,
      payload: updatedAllMessage,
    });
  } catch (error) {
    dispatch(showNetworkError(true));
    return dispatch({ type: "ERROR", payload: error });
  }
};

// send message - ✅ ĐƠN GIẢN HƠN
export const sendMessge = (messageData) => async (dispatch) => {
  try {
    const isFormData = messageData instanceof FormData;

    const newMessage = await axios({
      method: "POST",
      url: `${SERVER_ACCESS_BASE_URL}/api/message`,
      data: messageData,
      headers: isFormData
        ? {
            "Content-Type": "multipart/form-data",
          }
        : {},
    });

    return dispatch({ type: SEND_MESSAGE, payload: newMessage.data });
  } catch (error) {
    dispatch(showNetworkError(true));
    return dispatch({ type: "ERROR", payload: error });
  }
};

// clear all message
export const clearSelectedMessage = () => async (dispatch) => {
  try {
    return dispatch({
      type: "CLEAR_ALL_MESSAGE",
      payload: "",
    });
  } catch (error) {
    dispatch(showNetworkError(true));
    return dispatch({ type: "ERROR", payload: error });
  }
};

export const loadingToggleAction = (state) => {
  return {
    type: SHOW_TOOGLE_LOADING,
    payload: state,
  };
};

export const showNetworkError = (state) => {
  return {
    type: SHOW_NETWORK_ERROR,
    payload: state,
  };
};

// Get spam messages
export const getSpamMessages = (chatId) => async (dispatch) => {
  try {
    dispatch(loadingToggleAction(true));
    const response = await axios({
      method: "GET",
      url: `${SERVER_ACCESS_BASE_URL}/api/message/spam/${chatId}`,
    });
    dispatch(loadingToggleAction(false));
    return dispatch({ type: GET_SPAM_MESSAGES, payload: response.data });
  } catch (error) {
    dispatch(showNetworkError(true));
    return dispatch({ type: "ERROR", payload: error });
  }
};

// Mark message as spam
export const markMessageAsSpam = (messageId) => async (dispatch) => {
  try {
    const response = await axios({
      method: "PUT",
      url: `${SERVER_ACCESS_BASE_URL}/api/message/mark-spam/${messageId}`,
    });
    return dispatch({ type: MARK_AS_SPAM, payload: response.data });
  } catch (error) {
    dispatch(showNetworkError(true));
    return dispatch({ type: "ERROR", payload: error });
  }
};

// Mark message as not spam
export const markMessageAsNotSpam = (messageId) => async (dispatch) => {
  try {
    const response = await axios({
      method: "PUT",
      url: `${SERVER_ACCESS_BASE_URL}/api/message/mark-not-spam/${messageId}`,
    });
    return dispatch({ type: MARK_AS_NOT_SPAM, payload: response.data });
  } catch (error) {
    dispatch(showNetworkError(true));
    return dispatch({ type: "ERROR", payload: error });
  }
};
