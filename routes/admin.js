const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.get('/', function(req, res, next) {
    
    let authenticated = auth.checkAuthentication(req, res);
    // Stop rendering the page if we aren't authenticated
    if (!authenticated) {
        return;
    }

    let username = req.session.authenticatedUser;
	
    res.setHeader('Content-Type', 'text/html');
    res.write('<header><nav><ul><li><a href="/"> Home </a></li><li><a href="/listprod"> Find Products </a></li><li><a href="/showcart"> Your Cart </a></li><li> <a href="/listorder"> Past orders </a></li></ul></nav></header>');
    res.write("<style type=text/css> header {background-color: white; position: static; left: 0; right: 0;  top: 5px;  height: 30px;  display: flex;  align-items: center;  }  header * {  display: inline;  }  header li {  margin: 20px;  }  header li a {  color: blue;  text-decoration: none;  }  </style>");
    res.write('<h1 align="center"><font face="normal" color="#cf0921">Tasty Texts</font></h1><hr>');
    
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            res.write("<title>Administrator Page</title>");
            res.write("<h3>Administrator Sales Report by Day</h3>")
            

            let sqlQuery = "select year(orderDate) as year, month(orderDate) as month, day(orderDate) as day, SUM(totalAmount) as totalSum FROM OrderSummary GROUP BY year(orderDate), month(orderDate), day(orderDate)";
            let result = await pool.request().query(sqlQuery);
            
            var xValues = []
            var yValues = []
            for (let i = 0; i < result.recordset.length; i++) {
                let record = result.recordset[i];
                xValues.push(new Date(record.year + "-" + record.month + "-" + record.day))
                yValues.push(record.totalSum.toFixed(2))
            }
            //chart render attempt
            res.write(`<canvas id="adminChart" style="width:100%;max-width:700px"></canvas><script src="https://cdn.jsdelivr.net/npm/chart.js@3.6.2/dist/chart.min.js"></script> <script> const adminChart = new Chart(ctx, {type: "line",data: {labels:[${xValues}], datasets: [{label: 'Total Revenue ($)', backgroundColor: "rgba(0,0,0,1.0)",borderColor: "rgba(0,0,0,0.1)",data: [${yValues}],}]}, options: {scales: {x: {type: 'time',time: {unit: "quarter"}}}}}) </script>`)
            console.dir(`<canvas id="adminChart" style="width:100%;max-width:700px"></canvas>
            <script src="https://cdn.jsdelivr.net/npm/chart.js@3.6.2/dist/chart.min.js"></script> <script> const ctx = "adminChart";const adminChart = new Chart(ctx, {type: "line",data: {labels:${xValues}, datasets: [{backgroundColor: "rgba(0,0,0,1.0)",borderColor: "rgba(0,0,0,0.1)",data: ${yValues},}]},})`)
            

            res.write("<table class=\"table\" border=\"1\">");
            res.write("<tr><th>Order Date</th><th>Total Order Amount</th>");
            for (let i = 0; i < result.recordset.length; i++) {
                let record = result.recordset[i];
                res.write("<tr><td>" + record.year + "-" + record.month + "-" + record.day + "</td><td>$" + record.totalSum.toFixed(2) + "</td></tr>");
            }
            res.write("</table>");

            res.end();
        } catch(err) {
            console.dir(err);
            res.write(err + "");
            res.end();
        }
    })();
});

module.exports = router;