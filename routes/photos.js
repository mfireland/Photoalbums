var express = require('express');
var router = express.Router();
var model = require('./../lib/model/model-photos');
var globals = require('./../lib/globals');
var fs = require('fs');
var debug = require('debug')('photoalbums:router:photos');

/* GET photo by ID */
router.get('/id/:id', (req, res) => {
  debug('/photos/id: photoID=%d', req.param('id'));
  if (req.param('id')) {
    var params = {
      photoID : req.param('id')
    }
    model.getPhotoByID(params, (err, obj) => {
      if (err) {
	res.status(400).send({error: 'Invalid photo ID'});
      } else {
	res.send(obj);
      }
    });
  } else {
    res.status(400).send({error: 'Invalid login'});		
  }
});

/* GET photo search */
router.get('/search', (req, res) => {
  debug('/photos/search: query="%s"', req.param('query'));
  res.header('Cache-Control', 'no-cache, no-store');
  if (req.param('query')) {
    var params = {
      query : req.param('query')
    }
    model.getPhotosSearch(params, (err, obj) => {
      if (err) {
	res.status(400).send({error: 'Invalid photo search'});
      } else {
	res.send(obj);
      }
    });
  } else {
    res.status(400).send({error: 'No search term found'});
  }
});

/* POST create photo. */
router.post('/upload', (req, res) => {
  if (req.session && req.session.userID) {
    debug('/photos/upload: albumID=%d, userID=%d', req.param('albumID'), req.session.userID);
    if (req.param('albumID') && req.files.photo) {
      var params = {
	userID : req.session.userID,
	albumID : req.param('albumID')
      }
      if (req.param('caption')) {
	params.caption = req.param('caption');
      }
      fs.exists(req.files.photo.path, exists => {
	if (exists) {
	  params.filePath = req.files.photo.path;
	  var timestamp = Date.now();
	  params.newFilename = params.userID + '/' + params.filePath.replace('tmp/', timestamp);
	  uploadPhoto(params, (err, fileObject) => {
	    if (err) {
	      res.status(400).send({error: 'Invalid photo data'});
	    } else {
	      params.url = fileObject.url;
	      delete params.filePath;
	      delete params.newFilename;
	      model.createPhoto(params, (err, obj) => {
		if (err) {
		  res.status(400).send({error: 'Invalid photo data'});
		} else {
		  res.send(obj);
		}
	      });
	    }
	  });
	} else {
	  res.status(400).send({error: 'Invalid photo data'});
	}
      });
    } else {
      res.status(400).send({error: 'Invalid photo data'});
    }
  } else {
    debug('/photos/upload: albumID=%d, ERROR - No user session', req.param('albumID'));
    res.status(401).send({error: 'You must be logged in to upload photos'});
  }
});

/* POST delete photo. */
router.post('/delete', (req, res) => {
  debug('/photos/delete: photoID=%d', req.param('id'));
  if (req.session && req.session.userID) {
    if (req.param('id')) {
      var params = {
        userID : req.session.userID,
	photoID : req.param('id')
      }
      model.deletePhoto(params, (err, obj) => {
	if (err) {
	  res.status(400).send({error: 'Photo not found'});
	} else {
	  res.send(obj);
	}
      });
    } else {
      res.status(400).send({error: 'Invalid photo ID'});
    }
  } else {
    debug('/photos/delete: ERROR - No user session');
    res.status(401).send({error: 'Unauthorized to delete photos'});
  }
});

// Private functions
function uploadPhoto(params, callback) {
  debug('uploadPhoto: filePath=%s', params.filePath);
  fs.readFile(params.filePath, (err, imgData) => {
    if (err) {
      callback(err);
    } else {
      var contentType = 'image/jpeg';
      var uploadPath = 'uploads/' + params.newFilename;
      var uploadData = {
        Bucket : globals.awsVariables().bucket,
        Key : uploadPath,
        Body : imgData,
        ACL :'public-read',
        ContentType : contentType
      }
      putS3Object(uploadData, (err, data) => {
        if (err) {
          callback(err);
        } else {
          fs.unlink(params.filePath, err => {
            if (err) {
              callback(err);
            } else {
              callback(null, {url: uploadPath});
            }
          });
        }
      });
    }
  });
}

function putS3Object(uploadData, callback) {
  debug('putS3Object: bucket="%s", key="%s"', uploadData.Bucket, uploadData.Key);
  var aws = require('aws-sdk');
  if (globals.awsVariables().key) {
    aws.config.update({ accessKeyId: globals.awsVariables().key, secretAccessKey: globals.awsVariables().secret });
  }
  var s3 = new aws.S3();
  s3.putObject(uploadData, (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}


module.exports = router;
