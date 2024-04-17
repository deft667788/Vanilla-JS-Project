import { fetchGET, fetchPUT } from "./fetch.js";
import { addEventForEachName } from "./viewProfile.js";


export function processCreatorId(creatorId, creatorName, creatorFollowers) {
  function getAllInfo(data) {
    localStorage.setItem(data.name, data.id);
    localStorage.setItem(data.id, data.name);
    creatorName.textContent = data.name;

    data.watcheeUserIds.length == 1
      ? (creatorFollowers.textContent =
          data.watcheeUserIds.length + " follower")
      : (creatorFollowers.textContent =
          data.watcheeUserIds.length + " followers");
  }

  fetchGET(
    `user?userId=${creatorId}`,
    getAllInfo,
    "error when getting creator info"
  );
}

export function analyzeTime(date) {
  const currentTime = Date.now();
  const postTime = Date.parse(date);
  const timeStamp = currentTime - postTime;
  if (timeStamp > 86_400_000) {
    //  post 24 hours ago
    let retTime = new Date(postTime).toISOString();
    retTime = retTime.substring(0, 10).split("-");
    retTime = retTime[2] + "/" + retTime[1] + "/" + retTime[0];
    return retTime;
  } else if (3_600_000 < timeStamp < 86_400_000) {
    //  post within 24 hours
    const minutes = Math.trunc((timeStamp % 3_600_000) / 60_000);
    const hours = Math.trunc(timeStamp / 3_600_000);
    return hours + " hours" + minutes + " minutes ago";
  } else {
    //  post within last 1 hour
    const minutes = Math.trunc((timeStamp % 3_600_000) / 60_000);
    return minutes + " minutes ago";
  }
}

export function processUserLikes(user, likeUsers) {
  let node = document.createElement("p");
  let textnode = document.createTextNode(user);
  node.appendChild(textnode);
  node.classList.add("User-name");
  likeUsers.appendChild(node);
}

export function processEachComment(comment, commentContent) {
  //  Try to implement paging for post section
  let node = document.getElementById("comment-template").cloneNode(true);
  node.removeAttribute("id");
  node.childNodes[1].textContent = comment.userName;
  node.childNodes[3].textContent = comment.comment;
  commentContent.appendChild(node);
}

export function getNumberUserLikes(likeStr) {
  const processedStr = likeStr.split(" ");
  let currentNumber = Number(processedStr[1]);
  return currentNumber;
}

export function getMemberLikeList(postInfoid) {
  let rawArr = localStorage.getItem(`${postInfoid} Member List`).split(" ");
  let retArr = [];
  for (const item of rawArr) {
    if (item !== "") {
      retArr.push(item);
    }
  }
  return retArr;
}

export function removeUserFromLikes(loginUser, likeList, postInfoid) {
  let retStr = "";
  for (const item of likeList) {
    if (item !== loginUser) {
      retStr = retStr + " " + item;
    }
  }

  const likeMemberList = postInfoid + " Member List";
  localStorage.setItem(likeMemberList, retStr);
}
export function addUserintoLikes(loginUser, likeList, postInfoid) {
  let retStr = "";
  retStr = retStr + " " + loginUser;
  for (const item of likeList) {
    retStr = rerStr + " " + item;
  }

  const likeMemberList = postInfoid + " Member List";
  localStorage.setItem(likeMemberList, retStr);
}

export function likeJob(likeButton, postInfo, jobLikes, likeUsers) {
  //  request like this post to server
  likeButton.addEventListener("click", () => {
    const loginUser = localStorage.getItem("loginUser");
    const userName = localStorage.getItem(loginUser);
    const likeList = getMemberLikeList(postInfo.id);
    const userList = likeUsers.querySelectorAll("p");
    if (likeList.includes(loginUser) === true) {
      fetchPUT(
        "job/like",
        { id: postInfo.id, turnon: false },
        "Error happens when sending unlike request"
      );
      removeUserFromLikes(loginUser, likeList, postInfo.id);
      likeButton.textContent = "Like this Post!!!";
      let currentNumberUserLike =
        getNumberUserLikes(jobLikes.textContent) - 1;
      
      for (let item of userList) {
        if (item.textContent === userName) {
          item.remove();
          //  Delete user who just like the post
        }
      }

      jobLikes.textContent = "Like: " + currentNumberUserLike;
    } else {
      fetchPUT(
        "job/like",
        { id: postInfo.id, turnon: true },
        "Error happens when sending like request"
      );
      addUserintoLikes(loginUser, likeList, postInfo.id);
      likeButton.textContent = "Unlike this Post";
      let currentNumberUserLike =
        getNumberUserLikes(jobLikes.textContent) + 1;
      
      processUserLikes(userName, likeUsers);

      jobLikes.textContent = "Like: " + currentNumberUserLike;
    }
  });
}

export function renderEachPost(postInfo) {
  //  render all information for each post
  //  console.log(postInfo);
  let oldPost = document.getElementById("post-template");
  let newPost = oldPost.cloneNode(true);
  newPost.removeAttribute("id");
  const creatorContent = newPost.childNodes[1];
  const postContent = newPost.childNodes[3];

  //  Need to modify for insert image
  const creatorName = creatorContent.childNodes[3].childNodes[1];
  creatorName.classList.add("User-name");

  const followers = creatorContent.childNodes[3].childNodes[3];
  processCreatorId(postInfo.creatorId, creatorName, followers);

  const postDate = creatorContent.childNodes[3].childNodes[5];
  postDate.textContent = analyzeTime(postInfo.createdAt);

  const jobTitle = postContent.childNodes[1];
  jobTitle.textContent = postInfo.title;

  const startDate = postContent.childNodes[3];
  startDate.textContent = "Start at" + analyzeTime(postInfo.start);

  const jobDescription = postContent.childNodes[5];
  jobDescription.textContent = postInfo.description;

  const jobImage = newPost.childNodes[5];
  jobImage.src = postInfo.image;

  const likeAndComment = newPost.childNodes[7];

  const jobLikes = likeAndComment.childNodes[1];
  jobLikes.textContent = "Likes: " + postInfo.likes.length;

  const likeUsers = likeAndComment.childNodes[3];
  let userStr = "";
  for (const user of postInfo.likes) {
    userStr = userStr + " " + user.userId;
    localStorage.setItem(user.userName, user.userId);
    localStorage.setItem(user.userId, user.userName);
    processUserLikes(user.userName, likeUsers);
  }
  const likeMemberList = postInfo.id + " Member List";
  localStorage.setItem(likeMemberList, userStr);

  jobLikes.addEventListener("click", () => {
    //  implement a toggle to switch between hide and show
    if (likeUsers.classList.contains("Hidden")) {
      likeUsers.classList.remove("Hidden");
    } else {
      likeUsers.classList.add("Hidden");
    }
  });

  const jobComments = newPost.childNodes[5];
  jobComments.textContent = "Comments: " + postInfo.comments.length;

  const commentContent = likeAndComment.childNodes[7];
  for (const comment of postInfo.comments) {
    processEachComment(comment, commentContent);
  }

  jobComments.addEventListener("click", () => {
    //  implement a toggle to switch between hide and show
    if (commentContent.classList.contains("Hidden")) {
      commentContent.classList.remove("Hidden");
    } else {
      commentContent.classList.add("Hidden");
    }
  });

  const functionSection = likeAndComment.childNodes[9];
  const likeButton = functionSection.childNodes[1];
  const secondButton = functionSection.childNodes[3];
  likeJob(likeButton, postInfo, jobLikes, likeUsers);

  addEventForEachName(newPost);
  document.getElementById("post").insertBefore(newPost, oldPost);
  //  Insert the newly created node ahead of template node each time
}

export function renderHomePage() {
  document.getElementById("login").classList.add("Hidden");
  document.getElementById("homepage").classList.remove("Hidden");
  const renderPost = (data) => {
    //  TODO:debugging
    for (let item of data) {
      renderEachPost(item);
    }
  };
  let currentPage = localStorage.getItem("Page");
  localStorage.setItem("Page", Number(currentPage) + 5);
  //  Update page to retrieve next 5 Posts next time

  fetchGET(
    `job/feed?start=${currentPage}`,
    renderPost,
    "error happen when render"
  );
}