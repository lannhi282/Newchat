import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Custom hook để detect network với debounce
const useOnlineStatus = (debounceTime = 3000) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleOnline = () => {
      clearTimeout(timeoutId);
      setShowOffline(false);
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Chỉ hiển thị lỗi sau khi offline một khoảng thời gian
      timeoutId = setTimeout(() => {
        setShowOffline(true);
      }, debounceTime);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [debounceTime]);

  return { isOnline, showOffline };
};

const NetworkError = (props) => {
  const { isOnline, showOffline } = useOnlineStatus(3000); // 3 giây debounce

  // Nếu online hoặc chưa cần hiển thị offline thì render children
  if (isOnline || !showOffline) {
    return <>{props.children}</>;
  }

  // Hiển thị màn hình lỗi
  return (
    <Wrapper>
      <div className="container bg-black w-screen h-screen p-10">
        <div className="wrapper flex flex-col justify-center items-center w-full h-full p-5 rounded-lg">
          <div className="title text-center mb-6">
            <h1 className="text-4xl font-bold text-red-500">Whoops!</h1>
          </div>
          <div className="description text-center">
            <p className="text-lg">Có vấn đề với kết nối mạng của bạn</p>
            <p className="text-sm mt-2 opacity-70">
              Vui lòng kiểm tra kết nối internet và thử lại
            </p>
          </div>
          <button
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    </Wrapper>
  );
};

export default NetworkError;

const Wrapper = styled.div`
  .container {
    background-color: ${({ theme }) => theme?.colors?.bg?.primary || "#000"};
  }
  .wrapper {
    background-color: ${({ theme }) =>
      theme?.colors?.bg?.secondary || "#1a1a1a"};
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  .title h1 {
    color: ${({ theme }) => theme?.colors?.heading || "#fff"};
  }
`;
