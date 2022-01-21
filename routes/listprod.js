const express = require("express");
const router = express.Router();
const sql = require("mssql");
const moment = require("moment");

router.get("/", function (req, res, next) {
  res.setHeader("Content-Type", "text/html");
  res.write("<title>Edible Textbooks Orders List</title>");
  res.write(
    '<header><nav><ul><li><a href="/"> Home </a></li><li><a href="/listprod"> Find Products </a></li><li><a href="/showcart"> Your Cart </a></li><li> <a href="/listorder"> Past orders </a></li></ul></nav></header>'
  );

  res.write(
    "<style type=text/css> header {background-color: white; position: static; left: 0; right: 0;  top: 5px;  height: 30px;  display: flex;  align-items: center;  }  header * {  display: inline;  }  header li {  margin: 20px;  }  header li a {  color: blue;  text-decoration: none;  }  </style>"
  );
  res.write(
    '<h1 align="center"><font face="normal" color="#cf0921">Tasty Texts</font></h1><hr>'
  );
  res.write(
    '<h1><font face="" color="#db2323">Enter name of product:</font></h1>'
  );

  //get categories drop down menu
  res.write('<form method ="get" action="listprod">');
  res.write('<select class="selectpicker" name = "catName">');
  res.write('<optgroup label = "Course Category">');
  res.write('<option value=""> All </option>');
  res.write("<option> BIOL </option>");
  res.write("<option> MATH </option>");
  res.write("<option> APSC </option>");
  res.write("<option> COSC </option>");
  res.write("<option> POLI </option>");
  res.write("<option> WRLD </option>");

  res.write("</optgroup>");

  //get search bar
  res.write('<form method="get" action="listprod">');
  res.write('<input type="text" name="pName" size="50">');
  res.write(
    '<input type="submit" value="Submit"><input type="reset" value="Reset">'
  );
  res.write("</form>");

  res.write("</select>");
  res.write("</form>");

  (async function () {
    try {
      let pool = await sql.connect(dbConfig);

      let results = false;
      let sqlQuery =
        "USE tempdb; SELECT productId, productName, productPrice, categoryName FROM product JOIN category ON product.categoryId=category.categoryId ";

      if (req.query.pName && req.query.catName) {
        sqlQuery =
          sqlQuery +
          "WHERE productName LIKE @productName AND categoryName LIKE @categoryName";
        results = await pool
          .request()
          .input("productName", sql.VarChar, "%" + req.query.pName + "%")
          .input("categoryName", sql.VarChar, "%" + req.query.catName + "%")
          .query(sqlQuery);
      } else if (req.query.pName) {
        sqlQuery = sqlQuery + "WHERE productName LIKE @productName";
        results = await pool
          .request()
          .input("productName", sql.VarChar, "%" + req.query.pName + "%")
          .query(sqlQuery);
      } else if (req.query.catName) {
        sqlQuery = sqlQuery + "WHERE categoryName LIKE @categoryName";
        results = await pool
          .request()
          .input("categoryName", sql.VarChar, "%" + req.query.catName + "%")
          .query(sqlQuery);
      } else {
        results = await pool.request().query(sqlQuery);
      }
      res.write(
        '<table border="1"><tr><th align="left"><font face="Helvetica">Add to Cart</th><th align="left"><font face="Helvetica">Product Id</th><th align="left"><font face="Helvetica">Product Name</th><th align="left"><font face="Helvetica">Product Price</th><th align="left"><font face="Helvetica">Category Name</th></tr>'
      );
      for (let i = 0; i < results.recordset.length; i++) {
        let searchRes = results.recordset[i];
        let pId = searchRes.productId;
        let prName = searchRes.productName;
        let prPrice = searchRes.productPrice;
        let caName = searchRes.categoryName;
        let color = "black";
        if (caName == "BIOL") color = "#943131";
        if (caName == "MATH") color = "#ad8832";
        if (caName == "APSC") color = "#63ad32";
        if (caName == "COSC") color = "#33917b";
        if (caName == "POLI") color = "#338891";
        if (caName == "WRLD") color = "#334c91";
        res.write(
          "<tr><td>" +
            '<font face="Helvetica"><a href="addcart?id=' +
            pId +
            "&name=" +
            prName +
            "&price=" +
            prPrice +
            '">Add to Cart</a></font>' +
            '</td><td><font face="Helvetica" color="' +
            color +
            '">' +
            pId +
            '</font></td><td><font face="Helvetica" color="' +
            color +
            '">' +
            '<a href="product?id=' +
            pId +
            "&name=" +
            prName +
            "&price=" +
            prPrice +
            '">' +
            prName +
            "</a></font>" +
            '</font></td><td><font face="Helvetica" color="' +
            color +
            '">' +
            "$" +
            prPrice +
            '</font></td><td><font face="Helvetica" color="' +
            color +
            '">' +
            caName +
            "</font></td></tr>"
        );
        
      }
      res.write("</table>");


      // Top selling Products - PLACE ON MAIN PAGE SOMEHOW
      res.write( '</font><h3><font face="Helvetica">' +  "Our Top Selling Products" + "</font></h3>" );
      let pool2 = await sql.connect(dbConfig);
      let results2 = false;
      let sqlQuery2 = "USE tempdb; SELECT product.productId, productName, productPrice FROM orderProduct JOIN Product ON product.productId = orderProduct.productId ORDER BY quantity DESC ;";
      results2 = await pool2
      .request()
      .query(sqlQuery2);
      res.write(
        '<table border="1"><tr><th align="left"><font face="Helvetica">Add to Cart</th><th align="left"><font face="Helvetica">Product Id</th><th align="left"><font face="Helvetica">Product Name</th><th align="left"><font face="Helvetica">Product Price</th></tr>'
      );
      for (let i = 0; i < results2.recordset.length; i++) {
        let searchRes = results2.recordset[i];
        let prodId = searchRes.productId;
        let prodName = searchRes.productName;
        let prodPrice = searchRes.productPrice;
        let color = "black";
         
        if(i == 3){
          break
        }
        res.write(
          "<tr><td>" +
            '<font face="Helvetica"><a href="addcart?id=' +
            prodId +
            "&name=" +
            prodName +
            "&price=" +
            prodPrice +
            '">Add to Cart</a></font>' +
            '</td><td><font face="Helvetica" color="' +
            color +
            '">' +
            prodId +
            '</font></td><td><font face="Helvetica" color="' +
            color +
            '">' +
            '<a href="product?id=' +
            prodId +
            "&name=" +
            prodName +
            "&price=" +
            prodPrice +
            '">' +
            prodName +
            "</a></font>" +
            '</font></td><td><font face="Helvetica" color="' +
            color +
            '">' +
            "$" +
            prodPrice +
            '</font></td><td><font face="Helvetica" color="' +
            color +
            '">' +
            "</font></td></tr>"
        );
      }

      res.write("</table>");


      // Product Recommendations (put up top of page) 
    let userName = req.session.authenticatedUser;
     if(userName !=null){
     res.write( '</font><h3><font face="Helvetica">' +  "Suggestions based on your past purchases " + "</font></h3>" );
     let pool3 = await sql.connect(dbConfig);
     let results3 = false;
     let sqlQuery3 = "USE tempdb; SELECT cat.categoryId FROM orderProduct As orPr, Product AS pr, ordersummary AS orSum, customer AS cust , category AS cat WHERE pr.categoryId = cat.categoryId AND pr.productId = orPr.productId AND orPr.orderId = orSum.orderId AND orSum.customerId = cust.customerId AND cust.userid LIKE " + "'" + userName + "'" + " ORDER BY quantity DESC ;";
     //let sqlQuery3 = "USE tempdb; SELECT cat.categoryId FROM orderProduct As orPr, Product AS pr, ordersummary AS orSum, customer AS cust , category AS cat WHERE pr.categoryId = cat.categoryId AND pr.productId = orPr.productId AND orPr.orderId = orSum.orderId AND orSum.customerId = cust.customerId AND cust.userid LIKE 'beth' ORDER BY quantity DESC ;"

     results3 = await pool3
     .request()
     .query(sqlQuery3);
     res.write(
       '<table border="1"><tr><th align="left"><font face="Helvetica">Add to Cart</th><th align="left"><font face="Helvetica">Product Id</th><th align="left"><font face="Helvetica">Product Name</th><th align="left"><font face="Helvetica">Product Price</th></tr>'
     );
     for (let i = 0; i < results3.recordset.length; i++) {
       let searchRes = results3.recordset[i];
       let catId = searchRes.categoryId;
       if(i == 1){
         break
       }
        let pool4 = await sql.connect(dbConfig);
        let results4 = false;
        let sqlQuery4 =  "USE tempdb; SELECT productId, productName, productPrice, categoryName FROM product JOIN category ON product.categoryId=category.categoryId WHERE category.categoryId LIKE " + catId + ";"
        results4 = await pool4
        .request()
        .query(sqlQuery4);

       for (let i = 0; i < results4.recordset.length; i++) {
        let searchRes = results4.recordset[i];
        let prodId = searchRes.productId;
        let prodName = searchRes.productName;
        let prodPrice = searchRes.productPrice;
        let catName = searchRes.categoryName;
        let color = "black";
        
 
        res.write(
          "<tr><td>" +
            '<font face="Helvetica"><a href="addcart?id=' +
            prodId +
            "&name=" +
            prodName +
            "&price=" +
            prodPrice +
            '">Add to Cart</a></font>' +
            '</td><td><font face="Helvetica" color="' +
            color +
            '">' +
            prodId +
            '</font></td><td><font face="Helvetica" color="' +
            color +
            '">' +
            '<a href="product?id=' +
            prodId +
            "&name=" +
            prodName +
            "&price=" +
            prodPrice +
            '">' +
            prodName +
            "</a></font>" +
            '</font></td><td><font face="Helvetica" color="' +
            color +
            '">' +
            "$" +
            prodPrice +
            '</font></td><td><font face="Helvetica" color="' +
            color +
            '">' +
            catName +
            "</font></td></tr>"
        );
      }
       
     }
    }

     res.write("</table>");

     res.end();
   } catch (err) {
     console.dir(err);
     res.end();
   }

    
  })();
});

module.exports = router;

/**
    Useful code for formatting currency:
        let num = 2.87879778;
        num = num.toFixed(2); **/