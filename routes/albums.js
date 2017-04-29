var express = require('express');
var router = express.Router();
var model = require('./../lib/model/model-albums');
var debug = require('debug')('photoalbums:router:albums');

/* GET album by ID */
router.get('/id/:albumID', (req, res) => {
  debug('/albums/id: albumID=%s', req.param('albumID'));
  res.header("Cache-Control", "public, max-age=10");
  res.header("Expires", new Date(Date.now() + 10000).toUTCString());
  if (req.param('albumID')) {
    var params = {
      albumID : req.param('albumID')
    }
    model.getAlbumByID(params, (err, obj) => {
      if (err) {
	res.status(400).send({error: 'Invalid album ID'});
      } else {
	res.send(obj);
      }
    });
  } else {
    res.status(400).send({error: 'Invalid album ID'});
  }
});

/* POST create album. */
router.post('/upload', (req, res) => {
  if (req.session && req.session.userID) {
    debug('/albums/upload: userID=%s', req.session.userID);
    if (req.param('title')) {
      var params = {
	userID : req.session.userID,
	title : req.param('title')
      }
      model.createAlbum(params, (err, obj) => {
	if (err) {
	  res.status(400).send({error: 'Invalid album data'});
	} else {
	  res.send(obj);
	}
      });
    } else {
      res.status(400).send({error: 'Invalid album data'});
    }
  } else {
    debug('/albums/upload: ERROR - No user session');
    res.status(401).send({error: 'Unauthorized to create album'});
  }
});

/* POST delete album. */
router.post('/delete', (req, res) => {
  debug('/albums/delete: albumID=%s', req.param('albumID'));
  if (req.session && req.session.userID) {
    if (req.param('albumID')) {
      var params = {
	userID : req.session.userID,
	albumID : req.param('albumID')
      }
      model.deleteAlbum(params, (err, obj) => {
	if (err) {
	  res.status(400).send({error: 'Album not found'});
	} else {
	  res.send(obj);
	}
      });
    } else {
      res.status(400).send({error: 'Invalid album ID'});		
    }
  } else {
    debug('/albums/delete: ERROR - No user session');
    res.status(401).send({error: 'Unauthorized to delete album'});
  }
});


module.exports = router;
