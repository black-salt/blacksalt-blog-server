const { UserModel } = require("../models");
const { generateToken } = require("../middleware/token");
const { callbackModel } = require("../utils/index");
const Crypt = require("../utils/crypt");
let register = async (ctx) => {
  let { username, nickname, password, avatar, code } = ctx.request.body;
  try {
    if (username === "") {
      callbackModel(ctx, 1, null, "用户名不能为空");
      return;
    }
    if (nickname === "") {
      callbackModel(ctx, 1, null, "昵称不能为空");
      return;
    }
    if (password === "") {
      callbackModel(ctx, 1, null, "密码不能为空");
      return;
    }
    let res = await UserModel.find({ username });
    if (res.length !== 0) {
      callbackModel(ctx, 1, "该用户名已存在");
      return;
    }
    let user = new UserModel({
      username,
      nickname,
      password: Crypt.encrypt(password),
      avatar,
    });
    res = await user.save();
    if (res._id != null) {
      let token = generateToken({ _id: res._id });
      callbackModel(
        ctx,
        0,
        {
          _id: res._id,
          nickname,
          avatar,
          token,
        },
        "注册成功"
      );
    } else {
      callbackModel(ctx, 1, null, "注册失败，服务器异常");
    }
  } catch (e) {
    callbackModel(ctx, 1, null, "注册失败，服务器异常");
  }
};

let login = async (ctx) => {
  let { username, password } = ctx.request.body;
  let user = await UserModel.findOne({ username });
  if (user) {
    const user_id = user._id,
      checkPwd = Crypt.decrypt(password, user.password);
    if (checkPwd) {
      callbackModel(
        ctx,
        0,
        {
          token: generateToken({ _id: user_id }),
        },
        "登录成功"
      );
    } else {
      callbackModel(ctx, 1, null, "登录失败，用户名或者密码错误");
    }
  } else {
    callbackModel(ctx, 1, null, `${username}用户名不存在`);
  }
};

let getUserInfo = async (ctx) => {
  let _id = ctx._id;
  try {
    let res = await UserModel.findOne(
      { _id },
      {
        username: true,
        nickname: true,
        avatar: true,
      }
    );
    callbackModel(ctx, 0, res, "查询成功");
  } catch (e) {
    callbackModel(ctx, 1, null, "查询失败，服务器异常，请稍后再试");
  }
};

let updateNickname = async (ctx) => {
  let { nickname } = ctx.request.body;
  let _id = ctx._id;
  let res = await UserModel.updateOne({ _id }, { $set: { nickname } });
  if (res) {
    callbackModel(ctx, 0, null, "昵称修改成功");
  } else {
    callbackModel(ctx, 1, null, "昵称修改失败");
  }
};

let updateAvatar = async (ctx) => {
  let { avatar } = ctx.request.body;
  let _id = ctx._id;
  let res = await UserModel.updateOne({ _id }, { $set: { avatar } });
  if (res) {
    callbackModel(ctx, 0, null, "头像修改成功");
  } else {
    callbackModel(ctx, 1, null, "头像修改失败");
  }
};

module.exports = {
  register,
  login,
  getUserInfo,
  updateNickname,
  updateAvatar,
};
