const io = require('socket.io')(process.env.IO || 5001);

const http = require("http");
const fs = require("fs");
const path = require('path');
// uuid 
const uuid = require('uuid/v1'); //v1 

// files path : 
const folder = './data' // the folder containing the data to be shared
// define the path to the public files:
var folderPath = {
  root: path.join(__dirname, '../', folder),
};
console.log('root: ', folderPath.root)

// read the files
let files = [];

async function print(path) {
  const dir = await fs.promises.opendir(path);
  for await (const dirent of dir) {
    let type
    dirent.isDirectory() == true ? type = '/': type
    dirent.isFile() == true ? type = 'file': type // only files will be shared (v1)
    if (type == 'file'){
      // generate a uuid : 
      let name, id
      id = uuid();
      name = dirent.name 
      files.push({name, id});
    }
    console.log(dirent.name, type);
  }
  // emit files :
  io.emit('list', {files, length : files.length})
  console.log('files :', files)
}
print(folder).catch(console.error);

// @desc  Get all files data
// @route GET /api/v1/data
// @access Public
exports.getData = async (req, res, next) => {
  try {
    const data = files

    return res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


// @desc GET a data of a single file
// @route GET /share/:id/:requestType by parameter
// @access Public
exports.shareData = async (req, res, next) => {
  try {
    const id = req.params.id;
    const type = req.params.requestType;
    const data = {id, type};
    console.log('id :', id, 'request type : ', type)
    // find the file : 
    files.forEach(item=>{
      if(item.id == id){
        // emit on websocket:
        data.msg = 'success';
        if(type == 'd'){
          io.emit('downloading', item)
          // download :
          res.download(path.join(folderPath.root, item.name), (err)=>{
              if(err) console.error(err);
            });
            console.log('Your file has been downloaded!')
        }
        else if(type == 'v'){
          res.status(200).sendFile(item.name, folderPath, function (err) {
            if (err) {
              console.log(err);
              res.status(err.status).end();
            }
          });
        }else{
          res.status(500).json({ success: false, data, error: 'Server error' });
        }
      }
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data, error: 'Server error' });
  }
};
