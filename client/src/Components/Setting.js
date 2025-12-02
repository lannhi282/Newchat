import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useDispatch, useSelector } from "react-redux";

import ProfileEdit from "./modal/ProfileEdit";
import ImageEdit from "./modal/ImageEdit";

const Setting = () => {
  const user = useSelector((globalState) => globalState.user.userDetails);

  return (
    <Wrapper className="setting-tab dynamic-sidebar">
      <div className="relative flex items-center chat-menu flex-wrap justify-between w-full ">
        <div>
          <h2>Setting</h2>
          <p>Personal Information</p>
        </div>
        <div className="icon text-right"></div>
      </div>
      <div className="details p-4">
        <div className="setting-block">
          <div className="user-profile flex items-center flex-col py-3">
            <ImageEdit />
            <div className="user-name py-4 text-center w-full">
              <h5 className="text-xl font-medium">{user.name}</h5>
            </div>
          </div>
        </div>

        <div className="setting-block">
          <div className="profile-setting w-full pt-4">
            <ProfileEdit />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  animation: fadeInLeft 1s;
  .user-profile-img {
    width: 150px;
    height: 150px;
    img {
      min-width: 100%;
    }
  }

  .setting-block {
    border-bottom: 1px solid rgba(${({ theme }) => theme.colors.border});
  }

  .user-profile {
    position: relative;
    background-color: ${({ theme }) => theme.colors.bg.primary};

    .profile-photo-edit {
      position: absolute;
      right: 0;
      left: auto;
      bottom: 0;
      cursor: pointer;
      background-color: ${({ theme }) => theme.colors.bg.primary};
      .icon {
        color: ${({ theme }) => theme.colors.text.secondary};
        border-radius: 50%;
      }
    }
  }
  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .details {
      margin: 10px 50px 0px 50px;
    }
    .intro {
      padding: 3rem;
    }
  }
`;

export default Setting;
