const fetch = require("node-fetch");
const { generateToken } = require("../utils/jwt");

const follower = "582079c7-1023-41cf-a01c-f9ab68e7967d";
const followee = "fa5839a0-58cf-4556-ae7d-a68752a7069f";

(async () => {
  try {
    const token = generateToken({ id: follower });
    const token2 = generateToken({ id: followee });

    let res = await fetch("http://localhost:3000/v1/follows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ followeeId: followee }),
    });

    res = await fetch("http://localhost:3000/v1/follows", {
      headers: { Authorization: "Bearer " + token },
    });
    const body = await res.json();

    const follows = body && body.data ? body.data : [];
    const id = follows[0] && follows[0].id;

    if (id) {
      res = await fetch(`http://localhost:3000/v1/follows/record/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
    }

    res = await fetch("http://localhost:3000/v1/follows", {
      headers: { Authorization: "Bearer " + token },
    });

    res = await fetch("http://localhost:3000/v1/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });

    res = await fetch("http://localhost:3000/v1/auth/me", {
      headers: { Authorization: "Bearer " + token2 },
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
