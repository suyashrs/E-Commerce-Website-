const express = require("express");
const router = express.Router();
const sql = require("mssql");
const moment = require("moment");

router.get("/", function (req, res, next) {
  res.setHeader("Content-Type", "text/html");
  res.write('<header><nav><ul><li><a href="/"> Home </a></li><li><a href="/listprod"> Find Products </a></li><li><a href="/showcart"> Your Cart </a></li><li> <a href="/listorder"> Past orders </a></li></ul></nav></header>');
  res.write("<style type=text/css> header {background-color: white; position: static; left: 0; right: 0;  top: 5px;  height: 30px;  display: flex;  align-items: center;  }  header * {  display: inline;  }  header li {  margin: 20px;  }  header li a {  color: blue;  text-decoration: none;  }  </style>");
  res.write('<h1 align="center"><font face="normal" color="#cf0921">Tasty Texts</font></h1><hr>');
    
  res.write("<title>Tasty Texts</title>");

  let custId = false;
  if (
    req.query.customerId &&
    Number.isInteger(parseInt(req.query.customerId))
  ) {
    custId = parseInt(req.query.customerId);
  } else {
    res.write(
      "<h1>Invalid customer id.  Go back to the previous page and try again.</h1>"
    );
    res.end();
    return;
  }
  let productList = false;
  if (req.session.productList && req.session.productList.length > 0) {
    productList = req.session.productList;
  } else {
    res.write("<h1>Your shopping cart is empty!</h1>");
    res.end();
    return;
  }

  let sqlQuery =
    "SELECT customerId, firstName+' '+lastName as cname FROM Customer WHERE customerId = @custId";
  let orderId = false;
  let custName = false;
  (async function () {
    try {
      let pool = await sql.connect(dbConfig);

      let result = await pool
        .request()
        .input("custId", sql.Int, custId)
        .query(sqlQuery);
      custName = result.recordset[0].cname;

      let orderDate = moment().format("Y-MM-DD HH:mm:ss");
      sqlQuery =
        "INSERT INTO OrderSummary (customerId, totalAmount, orderDate) OUTPUT INSERTED.orderId VALUES(@custId, 0, @orderDate);";

      result = await pool
        .request()
        .input("custId", sql.Int, custId)
        .input("orderDate", sql.DateTime, orderDate)
        .query(sqlQuery);

      orderId = result.recordset[0].orderId;

      res.write("<h1>Your Order Summary</h1>");
      res.write(
        "<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>"
      );

      total = 0;
      for (let i = 0; i < productList.length; i++) {
        product = productList[i];
        if (!product) {
          continue;
        }

        res.write("<tr><td>" + product.id + " </td>");
        res.write("<td>" + product.name + " </td>");
        res.write('<td align="center">' + product.quantity + " </td>");

        price = Number(product.price).toFixed(2);
        quantity = Number(product.quantity);
        res.write('<td align="right">$' + price + " </td>");
        res.write(
          '<td align="right">$' + (price * quantity).toFixed(2) + " </td></tr>"
        );
        res.write("</tr>");

        total = total + price * quantity;

        sqlQuery =
          "INSERT INTO OrderProduct VALUES(@orderId, @pid, @quantity, @price)";
        pid = parseInt(product.id);

        result = await pool
          .request()
          .input("orderId", sql.Int, orderId)
          .input("pid", sql.Int, pid)
          .input("quantity", sql.Int, quantity)
          .input("price", sql.Decimal(10, 2), price)
          .query(sqlQuery);
      }

      res.write(
        '<tr><td colspan="4" align="right"><b>Order Total</b></td>\
                        <td aling="right">$' +
          total.toFixed(2) +
          "</td></tr>"
      );
      res.write("</table>");

      // Update order total
      console.log(total.toFixed(2));
      sqlQuery =
        "UPDATE OrderSummary SET totalAmount=@total WHERE orderId=@orderId";
      result = await pool
        .request()
        .input("total", sql.Decimal(10, 2), total.toFixed(2))
        .input("orderId", sql.Int, orderId)
        .query(sqlQuery);

      res.write("<h1>Order completed.  Will be shipped soon...</h1>");
      res.write("<h1>Your order reference number is: " + orderId + "</h1>");
      res.write(
        "<h1>Shipping to customer: " + custId + " Name: " + custName + "</h1>"
      );

      res.write('<h2><a href="/">Return to shopping</a></h2>');
      res.write('<h2><a href="ship">Check shipment</a></h2>');

      // Clear session variables (cart)
      req.session.destroy();

      res.end();
    } catch (err) {
      console.dir(err);
      res.write(err + "");
      res.end();
    }
  })();
});

module.exports = router;
