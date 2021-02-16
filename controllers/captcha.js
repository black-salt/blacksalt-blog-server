const svgCaptcha = require("svg-captcha");
const { callbackModel } = require("../utils/index");

let createCaptcha = async ctx => {
  // 配置背景图片颜色集合
  const colorMap = [
    "#eeeeee",
    "#edfedf",
    "#eeddff",
    "skyblue",
    "orange",
    "#c8c8c8"
  ];

  //随机颜色
  const randomColor = colorMap[Math.floor(Math.random() * colorMap.length)];

  const cap = svgCaptcha.create({
    size: 4, // 验证码长度
    width: 100,
    height: 40,
    fontSize: 50,
    ignoreChars: "0oO1ilI", // 排除字符
    noise: 2, // 干扰条数
    color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
    background: randomColor // 验证码图片背景颜色
  });

  // 保存生成的验证码结果
  ctx.session.code = cap.text;
  // 设置响应头
  ctx.response.type = "image/svg+xml";
  ctx.body = cap.data;
};

let verifyCaptcha = async ctx => {
  const serverCode = ctx.session.code.toLowerCase();
  const clientCode = ctx.query.code.toLowerCase();
  if (serverCode === clientCode) {
    callbackModel(ctx, 0, true, "验证成功");
  } else {
    callbackModel(ctx, 1, false, "验证码错误");
  }
};

module.exports = {
  createCaptcha,
  verifyCaptcha
};
