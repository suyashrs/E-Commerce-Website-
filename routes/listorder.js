const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>Tasty Texts Orders List</title>');
    res.write('<style type=text/css> header {background-color: white; position: static; left: 0; right: 0;  top: 5px;  height: 30px;  display: flex;  align-items: center;  }  header * {  display: inline;  }  header li {  margin: 20px;  }  header li a {  color: blue;  text-decoration: none;  }  </style>');
    res.write('<header><nav><ul><li><a href="/"> Home </a></li><li><a href="/listprod"> Find Products </a></li><li><a href="/showcart"> Your Cart </a></li><li> <a href="/listorder"> Past orders </a></li></ul></nav></header>');
    res.write('<h1 align="center"><font face="normal" color="#cf0921">Tasty Texts</font></h1><hr>');
    res.write("<h1>List of Orders</h1>");
    
    /** Create connection, and validate that it connected successfully **/
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);
            let orderInfo = await pool.request()
                .query("USE tempdb; SELECT orderId, CONVERT(VARCHAR,orderDate, 20) as dateFix, customer.customerId, firstname, lastname, totalAmount FROM ordersummary LEFT JOIN customer ON (orderSummary.customerId = customer.customerId)");
            
            res.write('<table border="1"><tbody><tr><th>Order ID</th><th>Order Date</th><th>Customer ID</th><th>Customer Name</th><th>Total Amount</th></tr>');
            /** For each order in the results
            Print out the order header information
            Write a query to retrieve the products in the order **/
            for (let i = 0; i < orderInfo.recordset.length; i++) {
                let result = orderInfo.recordset[i];
                let total = result.totalAmount;
                total = total.toFixed(2);
                res.write("<tr><td>" + result.orderId + "</td><td>" + result.dateFix + "</td>" + "</td><td>" + result.customerId + "</td>" 
                          + "</td><td>" + result.firstname + " " + result.lastname + "</td>" + "</td><td>" + "$" + total + "</td></tr>"); 
                          let orderContents = await pool.request()
                          .input('orderIdprep', sql.Int, result.orderId)
                          .query("SELECT productId, quantity, price FROM orderproduct WHERE orderId = @orderIdprep");
                          console.dir(orderContents)
                res.write('<tr align="right"><td colspan="5"><table border="1"><tbody><tr><th>Product Id</th> <th>Quantity</th> <th>Price</th></tr>')
                /** For each product in the order
                Write out product information **/
                for (let n = 0; n < orderContents.recordset.length; n++) {
                   let resultContent = orderContents.recordset[n];
                   productPrice = resultContent.price;
                   productPrice = productPrice.toFixed(2);
                   res.write('<td>' + resultContent.productId + "</td><td>" + resultContent.quantity + "</td>" + "</td><td>" + "$" + productPrice + "</td></tr>");
                   
               }
                res.write('</tbody></table></td></tr>');
            }
            res.write("</tbody></table>");

            res.end();
        } catch(err) {
            console.dir(err);
            res.end();
        }
    })();
    /**
    Useful code for formatting currency:
        let num = 2.87879778;
        num = num.toFixed(2); **/

});

module.exports = router;
