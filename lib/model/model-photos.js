var mysql = require('mysql');
var globals = require('./../globals');
var connection = mysql.createConnection(globals.database());
var debug = require('debug')('photoalbums:model:photos');

function createPhoto(params, callback) {
  debug('createPhoto: albumID="%d"', params.albumID);
  var query = 'INSERT INTO photos SET ? ';
  connection.query(query, params, (err, rows, fields) => {
    if (err) {
      debug('createPhoto: INSERT error: ', err);
      callback(err);
    } else {
      var response = {
	id : rows.insertId
      };
      callback(null, response);
    }
  });
}

function getPhotoByID(params, callback) {
  debug('getPhotoByID: photoID="%d"', params.photoID);
  var query = 'SELECT photoID, caption, url, albumID, userID FROM photos WHERE published=1 AND photoID=' + connection.escape(params.photoID);
  connection.query(query, (err, rows, fields) => {
    if (err) {
      debug('getPhotoByID: SELECT error: ', err);
      callback(err);
    } else {
      if (rows.length > 0) {
	callback(null, formatPhotoData(rows));
      } else {
	callback(null, []);
      }
    }
  });
}

function getPhotosByAlbumID(params, callback) {
  debug('getPhotosByAlbumID: albumID="%d"', params.albumID);
  var query = 'SELECT photoID, caption, url, albumID, userID FROM photos WHERE published=1 AND albumID=' + connection.escape(params.albumID);
  connection.query(query, (err, rows, fields) => {
    if (err) {
      debug('getPhotosByAlbumID: SELECT error: ', err);
      callback(err);
    } else {
      if (rows.length > 0) {
	callback(null, formatPhotoData(rows));
      } else {
	callback(null, []);
      }
    }
  });
}

function getPhotosSearch(params, callback) {
  debug('getPhotosSearch: query="%s"', '%' + params.query + '%');
  var query = 'SELECT photoID, caption, url, albumID, userID FROM photos WHERE caption LIKE "%' + params.query + '%"';
  connection.query(query, (err, rows, fields) => {
    if (err) {
      debug('getPhotosSearch: SELECT error: ', err);
      callback(err);
    } else {
      if (rows.length > 0) {
	callback(null, formatPhotoData(rows));
      } else {
	callback(null, []);
      }
    }
  });
}

function deletePhotoByID(params, callback) {
  debug('deletePhotoByID: photoID="%d" userID="%d"', params.photoID, params.userID);
  var query = 'UPDATE photos SET published=0 WHERE photoID=' + connection.escape(params.photoID) + ' AND userID=' + params.userID;
  connection.query(query, (err, rows, fields) => {
    if (rows.length > 0) {
      callback(null, rows);
    } else {
      if (rows.changedRows > 0) {
        callback(null, {message: 'Photo deleted successfully'});
      } else {
        var deleteError = new Error('Unable to delete photo');
        callback(deleteError);
      }
    }
  });
}

function formatPhotoData(rows) {
  debug('formatPhotoData: processing %d rows', rows.length);
  for (var i = 0; i < rows.length; i++) {
    var photo = rows[i];
    if (photo.url) {
      photo.url = globals.absoluteURL(photo.url);
    }
  }
  return rows;
}


exports.createPhoto = createPhoto;
exports.getPhotoByID = getPhotoByID;
exports.getPhotosByAlbumID = getPhotosByAlbumID;
exports.getPhotosSearch = getPhotosSearch;
exports.deletePhotoByID = deletePhotoByID;
