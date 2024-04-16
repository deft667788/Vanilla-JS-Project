import { errorPopup } from "./error_handle.js";
import { renderHomePage } from "./feed.js";
import { fetchPOST } from "./fetch.js";

export function login() {
  // need to be modified later for fetch
  const emailField = document.getElementById("email").value;
  const passwordField = document.getElementById("password").value;

  if(emailField === "" || passwordField === "") {
    errorPopup("Please input your email and password");
    return;
  }

  const successLogin = (data) => {
    if (localStorage.getItem("token") !== null) {
      //  ensure the user logged in can access the data
      localStorage.removeItem("token", data.token);
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("loginUser", data.userId);

    renderHomePage();
  };

  fetchPOST(
    "auth/login",
    { email: emailField, password: passwordField },
    successLogin,
    "Invalid Email and Password."
  );
}

export function registration() {
  const userEmail = document.getElementById("regis-email").value;
  const userName = document.getElementById("regis-name").value;
  const userPassword = document.getElementById("regis-password").value;
  const confirmPassword = document.getElementById("password-confirm").value;
  if (userPassword !== confirmPassword) {
    errorPopup("Passwords do not match!");
    return;
  }

  const successRegister = (data) => {
    if (localStorage.getItem("token") !== null) {
      localStorage.removeItem("token", data.token);
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("loginUser", data.userId);

    document.getElementById("login").classList.add("Hidden");
    renderHomePage();
  };
  
  fetchPOST(
    "auth/register",
    { email: userEmail, password: userPassword, name: userName },
    successRegister,
    "Invalid input"
  );
}

// sign in switch register
export function swap(page1, page2) {
  document.getElementById(page1).classList.add("Hidden");
  document.getElementById(page2).classList.remove("Hidden");
}