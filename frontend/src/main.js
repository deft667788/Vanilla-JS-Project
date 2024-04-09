// A helper you may want to use when uploading new images to the server.

import { login } from "./login_regis.js";

let signInButton = document.getElementById("sign-in-button");

signInButton.addEventListener("click", () => {
  login();
});