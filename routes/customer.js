const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');

router.get('/', function(req, res, next) {
    let authenticated = auth.checkAuthentication(req, res);
    // Stop rendering the page if we aren't authenticated
    if (!authenticated) {
        return;
    }

    let username = req.session.authenticatedUser;

    res.setHeader('Content-Type', 'text/html');
    res.write('<style type=text/css> header {background-color: white; position: static; left: 0; right: 0;  top: 5px;  height: 30px;  display: flex;  align-items: center;  }  header * {  display: inline;  }  header li {  margin: 20px;  }  header li a {  color: blue;  text-decoration: none;  }  </style>');
    res.write('<header><nav><ul><li><a href="/"> Home </a></li><li><a href="/listprod"> Find Products </a></li><li><a href="/showcart"> Your Cart </a></li><li> <a href="/listorder"> Past orders </a></li></ul></nav></header>');
    res.write('<h1 align="center"><font face="normal" color="#cf0921">Tasty Texts</font></h1><hr>');

    //Print Customer information
    res.write('<title>Customer Page</title>');
    res.write("<h3>Customer Profile</h3>");

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            let sqlQuery = "select customerId, firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password FROM Customer WHERE userid = @username";

            result = await pool.request()
                .input('username', sql.VarChar, username)
                .query(sqlQuery);

            if (result.recordset.length === 0) {
                console.log("No user under that userId available");
                res.end();
                return;
            } else {
                let user = result.recordset[0];
                res.write("<table class=\"table\" border=\"1\">");
                res.write("<tr><th>Id</th><td>"+user.customerId+"</td></tr>");	
                res.write("<tr><th>First Name</th><td>"+user.firstName+"</td></tr>");
                res.write("<tr><th>Last Name</th><td>"+user.lastName+"</td></tr>");
                res.write("<tr><th>Email</th><td>"+user.email+"</td></tr>");
                res.write("<tr><th>Phone</th><td>"+user.phonenum+"</td></tr>");
                res.write("<tr><th>Address</th><td>"+user.address+"</td></tr>");
                res.write("<tr><th>City</th><td>"+user.city+"</td></tr>");
                res.write("<tr><th>State</th><td>"+user.state+"</td></tr>");
                res.write("<tr><th>Postal Code</th><td>"+user.postalCode+"</td></tr>");
                res.write("<tr><th>Country</th><td>"+user.country+"</td></tr>");
                res.write("<tr><th>User id</th><td>"+user.userid+"</td></tr>");	
                res.write("</table>");
            }

            res.end()
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
