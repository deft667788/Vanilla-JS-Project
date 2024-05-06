import { fetchDelete, fetchPost, fetchPut } from "./fetch.js";
import { fileToDataUrl } from "./helpers.js";

//  Close post window based on whether we are posting or updating job
export function closePostWindow() {
  const closePost = document.getElementById("close-post-window");
  closePost.addEventListener("click", () => {
    document.getElementById("make-post-struc").classList.add("Hidden");
    const modifyButton = document.getElementById("modify-post");
    const putUpButton = document.getElementById("upload-post");

    if (!modifyButton.classList.contains("Hidden")) {
      //  We currently updating job
      modifyButton.classList.add("Hidden");
    }
    if (!putUpButton.classList.contains("Hidden")) {
      //  We currently posting job
      putUpButton.classList.add("Hidden");
    }
  })
}

//  Comment the job we are viewing
export function makeComment(postId, commentDiv) {
  const postBtn = document.getElementById("post-new-comment");
  postBtn.addEventListener("click", () => {
    const newComment = document.getElementById("new-comment").ariaValueMax;
    fetchPost("job/comment", {
      id: postId,
      comment: newComment,
    });
    commentDiv.classList.add("Hidden");
  });
}

//  Del a post in personal profile
export function delPost(postId, postDel, newJob) {
  postDel.addEventListener("click", () => {
    fetchDelete("job", {
      id: postId,
    });
    newJob.remove();
  });
}

//  Clear all info in post window
//  And popup the button according to the current operation
export function clearPostWindow(postButton) {
  const renderMakePost = document.getElementById("make-post-struc");
  if (
    renderMakePost.classList.contains("Hidden") &&
    postButton.classList.contains("Hidden")
  ) {
    renderMakePost.classList.remove("Hidden");
    postButton.classList.remove("Hidden");
    document.getElementById("post-header").value = "";
    document.getElementById("post-img").value = "";
    document.getElementById("post-start").value = "";
    document.getElementById("post-content").value = "";
  }
}

//  Post an new job
export function makePost() {
  const makePostBtn = document.getElementById("text-post");
  const putUp = document.getElementById("upload-post");
  makePostBtn.addEventListener("click", () => {
    clearPostWindow(putUp);
  });

  //  Upload all info to server via put request, to create an new job
  putUp.addEventListener("click", () => {
    const postTitle = document.getElementById("post-header").value;
    const postImage = document.getElementById("post-img").files[0];
    const postStart = document.getElementById("post-start").value;
    const postDescription = document.getElementById("post-content").value;
    fileToDataUrl(postImage)
      .then((data) => {
        fetchPost("job", {
          title: postTitle,
          image: data,
          start: postStart,
          description: postDescription,
        });
      })
      .then(() => {
        //  Close the post window automatically after make an new post
        document
          .getElementById("make-post-struc")
          .classList.add("Hidden");
        putUp.classList.add("Hidden");
      });
  });
}

//  Update profile via sending put request to server
export function updatePostButton() {
  const modiUp = document.getElementById("modify-post");

  //  Update job when click modify post button
  modiUp.addEventListener("click", () => {
    const postId = localStorage.getItem("currentPost");
    const postTitle = document.getElementById("post-header").value;
    const postImage = document.getElementById("post-img").files[0];
    const postStart = document.getElementById("post-start").value;
    const postDescription = document.getElementById("post-content").value;
    fileToDataUrl(postImage)
      .then((data) => {
        fetchPut(
          "job",
          {
            id: postId,
            title: postTitle,
            image: data,
            start: postStart,
            description: postDescription,
          },
          "error happens when updating job"
        );
      })
      .then(() => {
        //  Close the post window automatically after modifying the post
        document
          .getElementById("make-post-struc")
          .classList.add("Hidden");
        modiUp.classList.add("Hidden");
        console.log(document.getElementById("real-profile"));
      });
  });
}

//  Modify a job when click the button in profile
export function modiPost(postId, postModi) {
  //  popup the update post window
  postModi.addEventListener("click", () => {
    //  Set up postId in local storage, we can latter
    //  update job getting postId back
    localStorage.setItem("currentPost", postId);

    const modiUp = document.getElementById("modify-post");
    clearPostWindow(modiUp);
  });
}