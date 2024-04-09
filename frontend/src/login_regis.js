export function login() {
  //  Need to add parameters for user email and password
  fetch(`http://localhost:5005/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      email: "betty@email.com",
      password: "cardigan",
    }),
  })
    .then((res) => {
      if(res.ok) {
        return res.json();
      }
    })
    .then((data) => {
      console.log(data.token);
      console.log(data.userId);
    })
    .catch(() => {
      console.log("catch an error");
    });
}