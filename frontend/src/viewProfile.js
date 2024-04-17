//  This file is for milestone4, related to how to render user profile

export function renderProfile(userName) {
  const userId = localStorage.getItem(userName);
  console.log(userId);
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