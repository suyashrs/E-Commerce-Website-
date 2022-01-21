const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    let productList = false;
    res.setHeader('Content-Type', 'text/html');
   
    res.write("<title>Your Shopping Cart</title>");
    res.write('<header><nav><ul><li><a href="/"> Home </a></li><li><a href="/listprod"> Find Products </a></li><li><a href="/showcart"> Your Cart </a></li><li> <a href="/listorder"> Past orders </a></li></ul></nav></header>');
    res.write("<style type=text/css> header {background-color: white; position: static; left: 0; right: 0;  top: 5px;  height: 30px;  display: flex;  align-items: center;  }  header * {  display: inline;  }  header li {  margin: 20px;  }  header li a {  color: blue;  text-decoration: none;  }  </style>");
    res.write('<h1 align="center"><font face="normal" color="#cf0921">Tasty Texts</font></h1><hr>');
    
    if (req.session.productList) {
        productList = req.session.productList;
        res.write("<h1>Your Shopping Cart</h1>");
        res.write("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
        res.write("<th>Price</th><th>Subtotal</th></tr>");

        let total = 0;
        for (let i = 0; i < productList.length; i++) {
            product = productList[i];
            if (!product) {
                continue
            }

            res.write("<tr><td>" + product.id + "</td>");
            res.write("<td>" + product.name + "</td>");
            res.write("<td align=\"center\">"+'<input type="text" name="newqty" min="1" size="5" value="1">');
            res.write("<td align=\"right\">$" + Number(product.price).toFixed(2) + "</td>");
            res.write("<td align=\"right\">$" + (Number(product.quantity.toFixed(2)) * Number(product.price)).toFixed(2) + "</td></td>");
            res.write("<td><td>" + '<a href="showcart?delete=1">Remove Item From Cart</a></td>');
            res.write("<td><td>" +'<input type="button" onclick="update(1, newqty)" value="Update Quantity"></td></tr>');
                       
            total = total + product.quantity * product.price;
            
        }
        res.write("<tr><td colspan=\"4\" align=\"right\"><b>Order Total</b></td><td align=\"right\">$" + total.toFixed(2) + "</td></tr>");
        res.write("</table>");
       

        res.write("<h2><a href=\"checkout\">Check Out</a></h2>");
    } else{
        res.write('<h1><font face="normal" color="">Your shopping cart is empty!</h1>');
    }
    res.write('<h2><a href="listprod">Continue Shopping</a></h2>');

    res.end();
});

module.exports = router;