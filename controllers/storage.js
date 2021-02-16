const fs = require("fs");
const path = require("path");
const { callbackModel } = require("../utils/index");
const uploadUrl = "http://192.168.1.84:8191/upload/";

let fileUpload = async ctx => {
  const file = ctx.request.files.file;

  // 创建可读流
  const fileReader = fs.createReadStream(file.path);
  let uploadDir = "static/upload";

  // 创建可写流
  const writeStream = fs.createWriteStream(`${uploadDir}/${file.name}`);

  // 判断文件夹是否存在，没有则创建
  if (!fs.existsSync(uploadDir)) {
    fs.mkdir(path.join(__dirname, uploadDir), err => {
      if (err) {
        throw new Error(err);
      } else {
        fileReader.pipe(writeStream); // 可读流通过管道写入可写流
        callbackModel(ctx, 0, uploadUrl + `${file.name}`, "上传成功");
      }
    });
  } else {
    fileReader.pipe(writeStream);
    callbackModel(ctx, 0, uploadUrl + `${file.name}`, "上传成功");
  }
};
let fileDelete = async ctx => {
  ctx.body = "文件删除";
};

module.exports = {
  fileUpload,
  fileDelete
};
