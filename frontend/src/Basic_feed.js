import { fetchGET } from "./fetch.js";

export function ProcessCreatorId(creatorId) {
  function getAllInfo(data) {
    localStorage.setItem("CreatorName", data.name);
    localStorage.setItem("CreatorFollowers", data.watcheeUserIds.length);
  }

  fetchGET(
    `user?userId=${creatorId}`,
    getAllInfo,
    "error when getting creator info"
  );
}

export function AnalyzeTime(date) {
  let NewDate = Date.parse(date);
  //  console.log(NewDate.getDay());
}

export function renderEachPost(PostInfo) {
  //  render all information for each post

  let OldPost = document.getElementById("post-Template");
  let NewPost = OldPost.cloneNode(true);
  NewPost.removeAttribute("Id");
  const CreatorContent = NewPost.childNodes[1];
  const PostContent = NewPost.childNodes[3];

  ProcessCreatorId(PostInfo.creatorId);
  AnalyzeTime(PostInfo.createdAt);

  //  Need to modify for insert image
  const CreatorName = CreatorContent.childNodes[3].childNodes[1];
  CreatorName.textContent = localStorage.getItem("CreatorName");

  const Followers = CreatorContent.childNodes[3].childNodes[3];
  Followers.textContent =
    localStorage.getItem("CreatorFollowers") + " followers";

  const PostDate = CreatorContent.childNodes[3].childNodes[5];
  PostDate.textContent = PostInfo.createdAt;

  const JobTitle = PostContent.childNodes[1];
  JobTitle.textContent = PostInfo.title;

  const StartDate = PostContent.childNodes[3];
  StartDate.textContent = PostInfo.start;

  const JobDescription = PostContent.childNodes[5];
  JobDescription.textContent = PostInfo.description;

  const JobImage = PostContent.childNodes[7];

  const JobLikes = PostContent.childNodes[9];
  JobLikes.textContent = PostInfo.likes.length;

  const JobComments = PostContent.childNodes[11];
  JobComments.textContent = PostInfo.comments.length;

  document.getElementById("post").insertBefore(NewPost, OldPost);
  //  Insert the newly created node ahead of template node each time
}

export function renderHomePage() {
  document.getElementById("login").classList.add("Hidden");
  document.getElementById("homepage").classList.remove("Hidden");
  const renderPost = (data) => {
    alert(`There are ${data.length} posts`);
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