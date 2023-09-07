const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

/*post method*/
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedpassword = await bcrypt.hash(password, 10);
  const checkinguser = `select * from user where username='${username}';`;
  gettinguser = await db.get(checkinguser);
  if (gettinguser === undefined) {
    if (password.length < 5) {
      response.send("Password is too short");
    } else {
      const addinguser = `
  INSERT INTO
    user (name,username, password, gender, location)
  VALUES
    (
      '${name}',
      '${username}',
      '${hashedpassword}',
      '${gender}',
      '${location}'  
    );`;
      await db.run(addinguser);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
/*login details(authentication)*/
app.post("/login", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const checkinguser = `select * from user where username='${username}';`;
  gettinguser = await db.get(checkinguser);
  if (gettinguser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const comparing = await bcrypt.compare(password, gettinguser.password);
    if (comparing === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
/*changing passsword8*/
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const findinguser = `select * from user where username='${username}';`;
  const checkinguser = await db.get(findinguser);
  if (checkinguser === undefined) {
    response.send(400);
    response.send("Invalid User");
  } else {
    const comparing = await bcrypt.compare(oldPassword, checkinguser.password);
    if (comparing === true) {
      if (newPassword.length < 5) {
        response.send("Password is too short");
      } else {
        const encryptedone = await bcrypt.hash(newPassword, 10);
        const updating = `update user set password='${encryptedone}'
         where username='${username}';`;
        await db.run(updating);
        response.send("Password updated");
      }
    } else {
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
