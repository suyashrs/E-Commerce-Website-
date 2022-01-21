const express = require("express");
const router = express.Router();
const auth = require("../auth");
const sql = require("mssql");

router.post("/", function (req, res) {
  // Have to preserve async context since we make an async call
  // to the database in the validateLogin function.
  (async () => {
    let authenticatedUser = await validateLogin(req);
    if (authenticatedUser) {
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  })();
});

async function validateLogin(req) {
  if (!req.body || !req.body.username || !req.body.password) {
    return false;
  }

  let username = req.body.username;
  let password = req.body.password;
  let authenticatedUser = await (async function () {
    try {
      let pool = await sql.connect(dbConfig);

      // TODO: Check if userId and password match some customer account.
      // If so, set authenticatedUser to be the username.
      let sqlPass =
        "USE tempdb; SELECT * FROM customer WHERE userid=@username AND password=@password";

      let results = await pool
        .request()
        .input("username", sql.VarChar, username)
        .input("password", sql.VarChar, password)
        .query(sqlPass);
      console.dir(results);
      if (results.recordset.length > 0) {
        req.session.authenticatedUser = username;
        return true;
      } else {
        req.session.loginMessage =
          "Could not validate username and password with our system! Please return and try again.";
        return false;
      }
    } catch (err) {
      console.dir(err);
      return false;
    }
  })();

  return authenticatedUser;
}

module.exports = router;
