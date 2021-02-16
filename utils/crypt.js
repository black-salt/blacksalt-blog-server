// 对密码进行加盐加密处理
const bcrypt = require("bcryptjs");

const encrypt = (password) => {
  let salt = bcrypt.genSaltSync(5);
  let hash = bcrypt.hashSync(password, salt);
  return hash;
};

const decrypt = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

module.exports = {
  encrypt,
  decrypt,
};
