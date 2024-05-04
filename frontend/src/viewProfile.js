// this file is for milestone4, related to how to render user profile
import { errorPopup } from "./error_handle.js";
import { analyzeTime } from "./feed.js";
import { fetchGET, fetchPut } from "./fetch.js";
import { fileToDataUrl } from "./helpers.js";
import { delPost } from "./newPut.js";

// copy and process the template
function getWatchingUser(userId, watchedList, newProfile) {
  const userNode = document
    .getElementById("like-user-template")
    .cloneNode(true);
  userNode.removeAttribute("id");
  userNode.classList.remove("Hidden");

  const userImgNode = userNode.childNodes[1];
  const userNameNode = userNode.childNodes[3];
  function successFetchUserId(data) {
    // get info of all user watching this profile
    localStorage.setItem(data.name, data.id);
    localStorage.setItem(data.id, data.name);
    userNameNode.textContent = data.name;
    if (data.image !== undefined) {
      userImgNode.src = data.image;
    } else {
      userImgNode.src = "./../sample-user.png";
    }
    watchedList.appendChild(userNode);

    // remove current profile to render an new profile
    userNameNode.addEventListener("click", () => {
      newProfile.remove();
      renderProfile(userNameNode.textContent);
    });
  }

  fetchGET(
    `user?userId=${userId}`,
    successFetchUserId,
    "error happens when fetching user info"
  );
}

// clear watching list to re-render next time
function clearWatchList(newProfile) {
  const childList = newProfile.childNodes[3].querySelectorAll("div");

  for (let item of childList) {
    item.remove();
  }
}

// set up all user info
function processUserInfo(data, newProfile) {
  const userInfo = newProfile.childNodes[1];
  const userImg = userInfo.childNodes[1];
  // if user doesn't have img, replace with a sample img
  if (data.image !== undefined) {
    userImg.src = data.image;
  } else {
    userImg.src = "./../sample-user.png";
  }

  // process user info
  const userName = userInfo.childNodes[3];
  userName.textContent = data.name;

  const userId = userInfo.childNodes[5];
  userId.textContent = data.id;

  const userEmail = userInfo.childNodes[7];
  userEmail.textContent = data.email;

  const userWatchBy = userInfo.childNodes[9];
  userWatchBy.textContent =
    "watched by " +
    data.watcheeUserIds.length +
    (data.watcheeUserIds.length <= 1 ? " user" : " users");
}

// process all watch user
function processWatchList(data, newProfile) {
  const watchedList = newProfile.childNodes[3];
  let watcheeListIds = data.watcheeUserIds;
  // update user info for each watching user
  for (const user of watcheeListIds) {
    getWatchingUser(user, watchedList, newProfile);
  }
}

// process watch button
function processWatchButton(data, newProfile) {
  const watchButton = newProfile.childNodes[5];
  let watcheeListIds = data.watcheeUserIds;
  const watchedList = newProfile.childNodes[3];
  const myId = Number(localStorage.getItem("loginUser"));

  // set the default field of button to watch
  watchButton.textContent = "watch";

  // check whether the current profile we view is our own profile
  if (data.id === myId) {
    // hide this button, since we cannot watch/unwatch ourselves
    watchButton.classList.add("Hidden");
  } else {
    // show button when we view other user profile
    watchButton.classList.remove("Hidden");
  }

  for (const id of watcheeListIds) {
    // initialize button field
    if (myId === id) {
      watchButton.textContent = "unwatch";
    }
  }

  watchButton.addEventListener("click", () => {
    if (watchButton.textContent == "unwatch") {
      // we have watched this user
      watchButton.textContent = "watch";

      // delete our userId in watch list array
      clearWatchList(newProfile);
      const index = watcheeListIds.indexOf(myId);
      watcheeListIds.splice(index, 1);

      for (const user of watcheeListIds) {
        getWatchingUser(user, watchedList);
      }

      // send put request to server
      fetchPut(
        "user/watch",
        { email: data.email, turnon: false },
        "error happens when sending unwatch request to server"
      );
    } else {
      watchButton.textContent = "unwatch";
      watcheeListIds.push(myId);

      // re-render watch
      clearWatchList(newProfile);
      for (const user of watcheeListIds) {
        getWatchingUser(user, watchedList);
      }

      // send put request to server
      fetchPut(
        "user/watch",
        { email: data.email, turnon: true },
        "error happens when sending watch request to server"
      );
    }
  });
}

// process each job
function processJob(data, newProfile) {
  const jobs = data.jobs;
  for (let job of jobs) {
    const newJob = document.createElement("div");

    const newJobNode = document
      .getElementById("profile-post-template")
      .cloneNode(true);
    newJobNode.classList.remove("Hidden");

    const PostContent = newJobNode.childNodes[1].cloneNode(true);
    const PostImg = newJobNode.childNodes[3].cloneNode(true);
    const postDel = newJobNode.childNodes[5].cloneNode(true);
    // clone necessary node from post-template

    // Job-post-date
    PostContent.childNodes[1].textContent = analyzeTime(job.createdAt);

    // Job-title
    PostContent.childNodes[3].textContent = job.title;

    // Start-date
    PostContent.childNodes[5].textContent = analyzeTime(job.start);

    // Job-description
    PostContent.childNodes[7].textContent = job.description;

    // Job-image
    PostImg.src = job.image;

    newJob.append(PostContent);
    newJob.append(PostImg);
    newJob.append(postDel);
    delPost(job.id, postDel, newJob);

    newProfile.childNodes[7].append(newJob);
    // append new job to container
  }
}

function renderProfile(userName) {
  function successFetchInfo(data) {
    // bug exists when jump and watch between different users
    // remove homepage and show profile
    document.getElementById("homepage-content").classList.add("Hidden");

    const newProfile = document.getElementById("profile-page").cloneNode(true);
    newProfile.classList.remove("Hidden");
    newProfile.removeAttribute("id");
    newProfile.setAttribute("id", "real-profile");
    // build a new profile from template profile

    processUserInfo(data, newProfile);
    processWatchList(data, newProfile);
    processWatchButton(data, newProfile);
    processJob(data, newProfile);

    document.getElementById("homepage").append(newProfile);
  }

  const userId = localStorage.getItem(userName);
  fetchGET(
    `user?userId=${userId}`,
    successFetchInfo,
    "error happens when render user profile"
  );
}

// config every element with User-name class name in post section
export function addEventForEachName(newPost) {
  const userArr = newPost.getElementsByClassName("User-name");
  for (const ele of userArr) {
    // add eventLister for each user name
    ele.addEventListener("click", () => {
      renderProfile(ele.textContent);
    });
  }
}

// config profile for element at side bar
export function addEventForMyName() {
  // config "my profile" of side bar to render my own profile
  const myProfile = document.getElementById("my-profile");
  myProfile.addEventListener("click", () => {
    const myId = localStorage.getItem("loginUser");
    const myName = localStorage.getItem(myId);
    renderProfile(myName);
  });
}

// config update user profile button at top bar
export function updateProfile() {
  const updateProfileButton = document.getElementById("update-profile-button");
  const closeProfileButton = document.getElementById("close-upload-window");
  const uploadProfileButton = document.getElementById("upload-info");

  updateProfileButton.addEventListener("click", () => {
    // pop up update profile window
    const updateProfile = document.getElementById("update-profile");
    updateProfile.classList.remove("Hidden");

    // refresh content of all fields, to re-enter new info
    document.getElementById("new-email").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("new-name").value = "";
  });

  closeProfileButton.addEventListener("click", () => {
    // close update profile window
    const updateProfile = document.getElementById("update-profile");
    updateProfile.classList.add("Hidden");
  });

  uploadProfileButton.addEventListener("click", () => {
    // collect all new information for uploading
    const newEmail = document.getElementById("new-email").value;
    const newPassword = document.getElementById("new-password").value;
    const newName = document.getElementById("new-name").value;
    const newImg = document.querySelector('input[type="file"]').files[0];

    fileToDataUrl(newImg)
      .then((data) => {
        fetchPut(
          "user",
          {
            email: newEmail,
            password: newPassword,
            name: newName,
            image: data,
          },
          "error happens when upload uesr info"
        );
      })
      .then(() => {
        errorPopup("New info upload successfully!!!");
        // refresh all info after successfully upload
        document.getElementById("new-email").value = "";
        document.getElementById("new-password").value = "";
        document.getElementById("new-name").value = "";
        document.querySelector('input[type="file"]').value = "";
      });
  });
}

// config search bar to watch specific user via email
export function watchUserByBar() {
  const watchUserButton = document.getElementById("watch-user");
  const searchBarDiv = document.getElementById("search-div");
  const searchBar = document.getElementById("search-bar");

  let valid = false;

  watchUserButton.addEventListener("click", () => {
    searchBarDiv.classList.remove("Hidden");
    valid = true;
  });

  window.addEventListener("click", () => {
    if (valid) {
      valid = false;
    } else {
      // every time when we click outside of search bar, it will be reset and hiden
      searchBar.value = "";
      searchBarDiv.classList.add("Hidden");
    }
  });

  searchBar.addEventListener("click", () => {
    searchBarDiv.classList.remove("Hidden");
    valid = true;
  });

  searchBar.addEventListener("keydown", (key) => {
    // when we press enter on key board, the email we enter will be sent to server via PUT request
    if (key.code === "Enter") {
      const emailField = searchBar.value;
      if (emailField !== "") {
        fetchPut(
          "user/watch",
          { email: emailField, turnon: true },
          "error happens when watch user via email"
        );
      } else {
        alert("please enter email for watching user");
      }
    }
  });
}