//  This file is for milestone4, related to how to render user profile
import { fetchGET, fetchPUT } from "./fetch.js";

export function getWatchingUser(userId, watchedList) {
  //  Copy and process the template
  const userNode = document
    .getElementById("like-user-template")
    .cloneNode(true);
  userNode.removeAttribute("id");
  userNode.classList.remove("Hidden");

  const userImgNode = userNode.childNodes[1];
  const userNameNode = userNode.childNodes[3];
  function successFetchUserId(data) {
    //  Get info of all user watching this profile
    localStorage.setItem(data.name, data.id);
    localStorage.setItem(data.id, data.name);
    userNameNode.textContent = data.name;
    userImgNode.src = data.image;
    watchedList.appendChild(userNode);

    //userNameNode.addEventListener("click", () => {
    //  renderProfile(userNameNode.textContent);
    //});
  }

  fetchGET(
    `user?userId=${userId}`,
    successFetchUserId,
    "error happens when fetching user info"
  );
}

export function clearWatchList() {
  //  Clear watching list to re-render next time
  const childList = document
    .getElementById("profile-watched-by-list")
    .querySelectorALL("div");
  
  for (let item of childList) {
    item.remove();
  }
}

export function processUserInfo(data) {
  //  Remove homepage and render profile page
  document.getElementById("profile-template").classList.remove("Hidden");
  document.getElementById("homepage-content").classList.add("Hidden");

  document.getElementById("profile-user-img").src = data.image;
  document.getElementById("profile-user-name").textContent = data.name;
  document.getElementById("profile-user-id").textContent = data.id;

  document.getElementById("profile-user-email").textContent = data.email;
  document.getElementById("profile-user-watched-by").textContent =
    "watched by " +
    data.watcheeUserIds.length +
    (data.watcheeUserIds.length <= 1 ? " user" : " users");
    //  Process user info

    clearWatchList();
    const watchedList = document.getElementById("profile-watched-by-list");

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

    //  Check whether the current profile we view is our own profile
    if (data.id === myId) {
      //  Hide this button, since we cannot watch/unwatch ourselves
      watchButton.classList.add("Hidden");
    } else {
      //  Show button when we view other user profile
      watchButton.classList.remove("Hidden");
    }

    for(const id of watcheeListIds) {
      //  Initialise button field
      if (myId === id) {
        watchButton.textContent = "unwatch";
      }
    }
}

/* export function processCloseButton() {
  //  Config button to close profile
  const closeButton = document.getElementById("close-profile");

  //  Remove profile page and render homepage
  closeButton.addEventListener("click", () => {
    document.getElementById("profile-template").classList.add("Hidden");
    document.getElementById("homepage-content").classList.remove("Hidden");
  });
} */

export function processWatchButton(data) {
  const watchButton = document.getElementById("watch-and-unwatch-user");
  let watcheeListIds = data.watcheeUserIds;
  const watchedList = document.getElementById("profile-watched-by-list");
  const myId = Number(localStorage.getItem("loginUser"));

  function myfunc() {
    //  Define this function so that we can delete the eventhandler later
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
  }
  watchButton.addEventListener("click", myfunc);

  setTimeout(() => {
    //  We need to set timeout to wait for asynchronous operation
    const watchedList = document
      .getElementById("profile-watched-by-list")
      .getElementsByClassName("User-name");

    for (let item of watchedList) {
      item.addEventListener("click", () => {
        watchButton.removeEventListener("click", myfunc);
        //  we need to delete the original event handler for watch button, otherwise we will send to
        //  request to server after we switch to another user
        renderProfile(item.textContent);
      });
    }
  }, 100);
}

export function renderProfile(userName) {
  function successFetchInfo(data) {
    processUserInfo(data);
    processWatchButton(data);
    //  processCloseButton();
  }

  const userId = localStorage.getItem(userName);
  fetchGET(
    `user?userId=${userId}`,
    successFetchInfo,
    "error happens when render user profile"
  );
}

export function addEventForEachName(newPost) {
  const userArr = newPost.getElementsByClassName("User-name");
  for (const ele of userArr) {
    //  Add eventlistener for each user name
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