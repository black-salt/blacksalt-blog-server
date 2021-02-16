// API分发器
const user = require("./user");
const captcha = require("./captcha");
const storage = require("./storage");
const article = require("./article");

module.exports = {
  user,
  captcha,
  storage,
  article
};
