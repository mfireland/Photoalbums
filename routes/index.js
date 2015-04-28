var express = require('express');
var router = express.Router();
var debug = require('debug')('photoalbums:router:index');

/* GET home page. */
router.get('/', function(req, res) {
    debug('/: title="%s"', 'Photoalbums');
    res.render('index', { title: 'Photoalbums' });
});

module.exports = router;
