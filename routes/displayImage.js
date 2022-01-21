const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');
    console.dir("test disp") //bruh
    let id = req.query.id;
    let idVal = parseInt(id);
    if (isNaN(idVal)) {
        res.end();
        return;
    }

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);
            console.dir("test0")
            let sqlQuery = "USE tempdb; SELECT productImage FROM product ";
            if (req.query.id) {
                sqlQuery = sqlQuery + "WHERE productId LIKE @productId";
                results = await pool.request()
                    .input('productId', sql.INT, + req.query.id ) 
                    .query(sqlQuery);
                }else {
                    results = await pool.request()
                        .query(sqlQuery);
                }
            result = await pool.request()
                .input('id', sql.Int, idVal)
                .query(sqlQuery);

            if (result.recordset.length === 0) {
                console.log("No image record");
                res.end();
                return;
            } else {
                let productImage = result.recordset[0].productImage;
                console.dir("test")
                res.write(productImage);
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