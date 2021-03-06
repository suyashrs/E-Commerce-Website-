const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = false;
    if (req.session.authenticatedUser) {
        username = req.session.authenticatedUser;
    }
    
    // TODO: Display user name that is logged in (or nothing if not logged in)	
    res.render('index', {
        title: "Tasty Text Home",
        username: username
        // HINT: Look at the /views/index.handlebars file
        // to get an idea of how the index page is being rendered
    });
})

module.exports = router;
