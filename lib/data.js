//
const fs = require('fs');
// পাথ তৈরী করার জন্য
const path = require('path');

//
const lib = {};

// base directory of the data folder
// পাথ
lib.basedir = path.join(__dirname, '../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
  fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // convert data to string
      const stringData = JSON.stringify(data);
      fs.writeFile(fileDescriptor, stringData, (err2) => {
        if (!err2) {
          fs.close(fileDescriptor, (err3) => {
            if (!err3) {
              callback(false);
            } else {
              callback('error closing the file');
            }
          });
        } else {
          callback('could not write to the new file');
        }
      });
    } else {
      callback('There was an error, file may already exists');
    }
  });
};

//
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
    callback(err, data);
  });
};

//
lib.update = (dir, file, data, callback) => {
  fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if (!err) {
      fs.ftruncate(fileDescriptor, (err1) => {
        if (!err1) {
          const stringData = JSON.stringify(data);
          fs.writeFile(fileDescriptor, stringData, (err2) => {
            if (!err2) {
              fs.close(fileDescriptor, (err3) => {
                if (!err3) {
                  callback(false);
                } else {
                  callback('Error closing');
                }
              });
            } else {
              callback('Error writing');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Error updating. File may not exist');
    }
  });
};

//
lib.delete = (dir, file, callback) => {
  fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting file');
    }
  });
};

// list all the items in a directory
lib.check = (dir, callback) => {
  fs.readdir(`${lib.basedir + dir}`, (err, fileNames) => {
    if (!err && fileNames && fileNames.length > 0) {
      const trimmedFileNames = [];
      fileNames.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback('error reading the directory');
    }
  });
};

//
module.exports = lib;
