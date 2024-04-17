//  This file is for milestone4, related to how to render user profile
import { fetchGET, fetchPUT } from "./fetch.js";

export function getWatchingUser(userId, watchedList) {
  const userNode = document
    .getElementById("like-user-template")
    .cloneNode(true);
  userNode.removeAttribute("id");

  const userImgNode = userNode.childNodes[1];
  const userNameNode = userNode.childNodes[3];

  function successFetchUserId(data) {
    localStorage.setItem(data.name, data.id);
    localStorage.setItem(data.id, data.name);
    userNameNode.textContent = data.name;
    userImgNode.src = data.image;
    watchedList.appendChild(userNode);

    userNode.addEventListener("click", () => {
      renderProfile(userNameNode.textContent);
    });
  }

  fetchGET(
    `user?userId=${userId}`,
    successFetchUserId,
    "error happens when fetching user info"
  );
}

export function renderProfile(userName) {
  const userId = localStorage.getItem(userName);
  
  function clearWatchList() {
    //  Clear watching list to re-render next time
    const childList = document
      .getElementById("profile-watched-by-list")
      .querySelectorALL("div");

    for (let item of childList) {
      item.remove();
    }
  }

  function successFetchInfo(data) {
    document.getElementById("profile-template").classList.remove("Hidden");
    document.getElementById("profile-user-img").src = data.image;
    document.getElementById("profile-user-name").textContent = data.name;
    document.getElementById("profile-user-id").textContent = data.id;
    document.getElementById("profile-user-email").textContent = data.email;
    document.getElementById("profile-user-watched-by").textContent =
      "watch by " +
      data.watcheeUserIds.length +
      (data.watcheeUserIds.length <= 1 ? " user" : " users");
    //  process user info
    const watchedList = document.getElementById("profile-watched-by-list");

    clearWatchList();

    let watcheeListIds = data.watcheeUserIds;
    //  Update user info for each watching user
    for (const user of watcheeListIds) {
      getWatchingUser(user, watchedList);
    }

    //  Check whether we have watched this user
    const myId = Number(localStorage.getItem("loginUser"));

    //  Set the default field of button to watch
    const watchButton = document.getElementById("watch-and-unwatch-user");
    watchButton.textContent = "watch";

    //  Check whether the current profile we view us our own profile
    if (data.id === myId) {
      //  Hide this button, since we cannot watch/unwatch our own profile
      watchButton.classList.add("Hidden");
    } else {
      //  Show button when we view other user profile
      watchButton.classList.remove("Hidden");
    }

    for (const id of watcheeListIds) {
      if (myId === id) {
        watchButton.textContent = "unwatch";
      }
    }
    watchButton.addEventListener("click", () => {
      if (watchButton.textContent == "unwatch") {
        //  we have watched this user
        watchButton.textContent = "watch";
        clearWatchList();
        const index = watcheeListIds.indexOf(myId);
        watcheeListIds.splice(index, 1);
        //  Delete our userId in watch list array

        for (const user of watcheeListIds) {
          getWatchingUser(user, watchedList);
        }

        //  Send put request to server
        fetchPUT(
          "user/watch",
          { email: data.email, turnon: false },
          "error happens when sending unwatch request to server"
        );
      } else {
        watchButton.textContent = "unwatch";
        watcheeListIds.push(myId);

        //  re-render watch
        clearWatchList();
        for (const user of watcheeListIds) {
          getWatchingUser(user, watchedList);
        }

        //  Send put request to server
        fetchPUT(
          "user/watch",
          { email: data.email, turnon: true },
          "error happens when sending watch request to server"
        );
      }
    });

    //  Config button to close profile
    const closeButton = document.getElementById("close-profile");

    closeButton.addEventListener("click", () => {
      document.getElementById("profile-template").classList.add("Hidden");
    });
  }

  fetchGET(
    `user?userId=${userId}`,
    successFetchInfo,
    "error happens when render user profile"
  );
}

export function addEventForEachName(newPost) {
  const userArr = newPost.getElementsByClassName("User-name");
  for (const ele of userArr) {
    //  Add eventlistener for each each user name
    ele.addEventListener("click", () => {
      renderProfile(ele.textContent);
    });
  }
}

export function addEventForMyname() {
  //  Config "my profile" of side bar to render my own profile
  const myProfile = document.getElementById("my-profile");
  myProfile.addEventListener("click", () => {
    const myId = localStorage.getItem("loginUser");
    const myName = localStorage.getItem(myId);
    renderProfile(myName);
  });
}