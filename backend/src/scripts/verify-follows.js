const fetch = require("node-fetch");
const { generateToken } = require("../utils/jwt");

const follower = "582079c7-1023-41cf-a01c-f9ab68e7967d";
const followee = "fa5839a0-58cf-4556-ae7d-a68752a7069f";

(async () => {
  try {
    const token = generateToken({ id: follower });
    const token2 = generateToken({ id: followee });

    console.log("USING TOK:", token.slice(0, 20) + "...");

    let res = await fetch("http://localhost:3000/v1/follows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ followeeId: followee }),
    });
    console.log("\nPOST /v1/follows ->", res.status);
    console.log(await res.text());

    res = await fetch("http://localhost:3000/v1/follows", {
      headers: { Authorization: "Bearer " + token },
    });
    console.log("\nGET /v1/follows (follower) ->", res.status);
    const body = await res.json();
    console.log(JSON.stringify(body, null, 2));

    const follows = body && body.data ? body.data : [];
    const id = follows[0] && follows[0].id;
    console.log("found follow id:", id);

    if (id) {
      res = await fetch(`http://localhost:3000/v1/follows/record/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      console.log("\nDELETE /v1/follows/record/:id ->", res.status);
      console.log(await res.text());
    } else {
      console.log("No follow id to delete");
    }

    res = await fetch("http://localhost:3000/v1/follows", {
      headers: { Authorization: "Bearer " + token },
    });
    console.log("\nGET /v1/follows (after delete) ->", res.status);
    console.log(await res.text());

    res = await fetch("http://localhost:3000/v1/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });
    console.log("\nGET /v1/auth/me (follower) ->", res.status);
    console.log(await res.text());

    res = await fetch("http://localhost:3000/v1/auth/me", {
      headers: { Authorization: "Bearer " + token2 },
    });
    console.log("\nGET /v1/auth/me (followee) ->", res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
