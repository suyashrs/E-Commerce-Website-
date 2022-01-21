const express = require("express");
const router = express.Router();
const sql = require("mssql");
const moment = require("moment");

router.get("/", function (req, res, next) {
  res.setHeader("Content-Type", "text/html");
  res.write("<title>Shipping Order Info: Tasty Texts</title>");
  res.write(
    '<header><nav><ul><li><a href="/"> Home </a></li><li><a href="/listprod"> Find Products </a></li><li><a href="/showcart"> Your Cart </a></li><li> <a href="/listorder"> Past orders </a></li></ul></nav></header>'
  );
  res.write(
    "<style type=text/css> header {background-color: white; position: static; left: 0; right: 0;  top: 5px;  height: 30px;  display: flex;  align-items: center;  }  header * {  display: inline;  }  header li {  margin: 20px;  }  header li a {  color: blue;  text-decoration: none;  }  </style>"
  );
  res.write(
    '<h1 align="center"><font face="normal" color="#cf0921">Tasty Texts</font></h1><hr>'
  );

  // TODO: Get order id
  // TODO: Check if valid order id

  let orderId = req.query.orderId;

  orderId = parseInt(orderId);
  console.dir(orderId);
  if (!Number.isInteger(parseInt(orderId))) {
    res.write(`<h1>Invalid order ID.</h1>`);
    return;
  }
  console.dir(orderId);

  (async function () {
    try {
      console.dir(orderId);
      let pool = await sql.connect(dbConfig);

      //////////////////////////////
      // Prepare Query Statements //
      //////////////////////////////

      //Find order by orderId
      // let orderQuery = "SELECT * FROM orderSummary WHERE orderId=@orderId";
      let orderQuery =
        "SELECT productId, quantity FROM orderProduct WHERE orderId=@orderID";

      //Update orderSummary to for shipped order

      let results = await pool
        .request()
        .input("orderId", sql.Int, orderId)
        .query(orderQuery);

      //console.dir(results.recordset[0].orderId);

      if (!results.recordset[0]) {
        res.write(`<h3>Order id is invalid / Empty Order</h3>`);
        return;
      } else {
        orders = results.recordset;

        const trxn = new sql.Transaction(pool);

        trxn.begin(async (err) => {
          if (err) {
            console.dir(err);
            console.dir("This is an error");
            return;
          }
          let rB = false; //check if rollback

          for (let i = 0; i < orders.length; i++) {
            let prodId = orders[i].productId;
            //Check inventory quantities with warehouse 1
            let prodQuery =
              "SELECT quantity FROM productInventory WHERE warehouseId=1 AND productId=@productId";
            let prodRes = await pool
              .request()
              .input("productId", sql.Int, prodId)
              .query(prodQuery);

            let ordQuantity = orders[i].quantity;
            let tempQuant = 0;

            if (prodRes.recordset[0]) {
              tempQuant = prodRes.recordset[0].quantity;
            }
            let leftoverQuant = tempQuant - ordQuantity;

            //let productId = prodRes.recordset[0].productId;
            //productId = parseInt(productId);
            //console.dir(productId.toString());
            if (leftoverQuant > 0) {
              // res.write is causing an issue
              res.write(
                `<h3>Ordered Product: ${prodId}, Ordered Quantity: ${ordQuantity}, Previous Inventory: ${tempQuant}, New Inventory: ${leftoverQuant}</h3>`
              ); //Product ID is undefined
              let updInvQuery = `UPDATE productInventory SET quantity=@leftoverQuant WHERE productId=@productId`;

              await trxn
                .request()
                .input("leftoverQuant", sql.Int, leftoverQuant)
                .input("productId", sql.Int, prodId)
                .query(updInvQuery);
            } else {
              rB = true;
              res.write(
                `<h3>Shipment Incomplete. Insufficient inventory for Product ID: ${prodId}</h3>`
              );
              trxn.rollback();
              res.end();

              return; //return due to unsuccessful shipment
            }
          }

          if (!rB) {
            //if no rollback => update shipment
            let shipmentDate = new Date(Date.now());
            //Add to shipments with new shipment info
            let newShipQuery =
              "INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId) VALUES (@shipmentDate, '', 1)";

            await trxn
              .request()
              .input("shipmentDate", sql.Date, shipmentDate)
              .query(newShipQuery);

            res.write(`<h2>Shipment successfully processed.</h2>`); //res.write() is causing crashes
            console.dir("Successful process");
            trxn.commit((err) => {
              console.dir(err);
              console.dir("Function has been called");
              res.end();
            });
          }
        });
      }
    } catch (err) {
      console.dir(err);
      res.write(err);
      res.end();
    }
  })();
});

module.exports = router;