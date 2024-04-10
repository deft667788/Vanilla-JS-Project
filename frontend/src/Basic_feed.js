import { fetchGET } from "./fetch.js";

export function renderHomePage() {
  const renderPost = (data) => {
    document.getElementById("Login").classList.add("hidden");
    document.getElementById("HomePage").classList.remove("hidden");
    alert("Start render user webpage");
    alert(`There are ${data.length} posts`);
    //  TODO:debugging
  };

  fetchGET("job/feed?start=0", renderPost, "");
}