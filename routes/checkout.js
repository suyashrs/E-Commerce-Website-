const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<header><nav><ul><li><a href="/"> Home </a></li><li><a href="/listprod"> Find Products </a></li><li><a href="/showcart"> Your Cart </a></li><li> <a href="/listorder"> Past orders </a></li></ul></nav></header>');
    res.write("<style type=text/css> header {background-color: white; position: static; left: 0; right: 0;  top: 5px;  height: 30px;  display: flex;  align-items: center;  }  header * {  display: inline;  }  header li {  margin: 20px;  }  header li a {  color: blue;  text-decoration: none;  }  </style>");
    res.write('<h1 align="center"><font face="normal" color="#cf0921">Tasty Texts</font></h1><hr>');
    
    res.write("<title>Grocery CheckOut Line</title>");

    res.write("<h1>Enter your customer id to complete the transaction:</h1>");

    res.write('<form method="get" action="order">');
    res.write('<input type="text" name="customerId" size="50">');
    res.write('<input type="submit" value="Submit"><input type="reset" value="Reset">');
    res.write('</form>');

    res.end();
});

module.exports = router;
