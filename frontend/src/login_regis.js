
export function login() {
  // need to be modified later for fetch
  const emailField = document.getElementById("email").value;
  //  console.log(emailField);
  const passwordField = document.getElementById("password").value;
  //  console.log(passwordField);

  fetch(`http://localhost:5005/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      email: emailField,
      password: passwordField,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
    })
    .then((data) => {
      // process user data
      console.log(data.token);
      console.log(data.userId);
    })
    .catch(() => {
      errorPopup(
        "Your email and password don't match!!! Please try again"
      );
    });
}

export function registration() {
  const userEmail = document.getElementById("regis-email").value;
  const userName = document.getElementById("regis-name").value;
  const userPassword = document.getElementById("regis-password").value;
  const confirmPassword = document.getElementById("password-confirm").value;
  if (userPassword !== confirmPassword) {
    errorPopup("Your two passwords don't match!!! Please try again");
    return;
  }

  fetch(`http://localhost:5005/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      email: userEmail,
      password: userPassword,
      name: userName,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
    })
    .then((data) => {
      // process user data
      console.log(data.token);
      console.log(data.userId);
    })
    .catch(() => {
      errorPopup("Invalid input");
    });
}

export function errorPopup(errorMessage = "error happens") {
  // for testing this function, please modify the predefined value in email/password field
  document.getElementById("error-message").textContent = errorMessage;
  const errorBox = document.getElementById("error-box");
  errorBox.classList.remove("hidden");
  const closeButton = document.getElementById("close-error-window");
  closeButton.addEventListener("click", () => {
    errorBox.classList.add("hidden");
  });
  // resume from error
}

// sign in switch register
export function swap(page1, page2) {
  document.getElementById(page1).classList.add("hidden");
  document.getElementById(page2).classList.remove("hidden");
}