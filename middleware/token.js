const jwt = require("jsonwebtoken");
const { TOKEN_ENCODE_STR, URL_YES_PASS } = require("../config");
const { UserModel } = require("../models");

module.exports = {
  // 生成token
  generateToken(payload) {
    return jwt.sign(payload, TOKEN_ENCODE_STR, { expiresIn: "1d" });
  },
  /*
    验证登录token是否正确 => 写成中间件
    get请求与设置的请求不拦截验证，其余均需登录
  */
  async verifyToken(ctx, next) {
    let url = ctx.url;
    if (url === "/favicon.ico") {
      return;
    }
    let tempUrl = url.indexOf("?") !== -1 ? url.split("?")[0] : url; //处理url可能有参数的情况 例：url?key=value
    if (tempUrl.indexOf("/api") !== -1 && !URL_YES_PASS.includes(tempUrl)) {
      // ctx.get("Authorization") 获取前端请求体中的信息
      let token = ctx.get("Authorization").split(" ")[1];
      if (token == "") {
        // 直接抛出错误
        ctx.response.status = 401;
        ctx.response.body = "你还没有登录，快去登录吧!";
        return;
      }
      try {
        // 验证token是否过期
        let { _id } = await jwt.verify(token, TOKEN_ENCODE_STR);
        // 验证token与账号是否匹配
        let res = await UserModel.findOne({ _id });
        if (!res) {
          ctx.response.status = 401;
          ctx.response.body = "登录过期，请重新登录!";
          return;
        }
        // 保存用户的_id，便于操作
        ctx._id = res._id;
      } catch (e) {
        ctx.response.status = 401;
        ctx.response.body = "登录已过期请重新登录!";
        return;
      }
    }
    await next();
  },

  /*
    解析token
  */
  getUserIdByToken(token) {
    let result = jwt.verify(token, TOKEN_ENCODE_STR);
    return result._id;
  },
};
