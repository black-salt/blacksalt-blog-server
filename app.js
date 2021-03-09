const Koa = require("koa");
const cors = require("koa2-cors");
const session = require("koa-session");
const parameter = require("koa-parameter");
const bouncer = require("koa-bouncer");
const koaBody = require("koa-body");
const static = require("koa-static");
const path = require("path");
const { port } = require("./config");
const { verifyToken } = require("./middleware/token");
// 实例化koa
const app = new Koa();

app.keys = ["some secret hurr"];
const CONFIG = {
  key: "koa:sess",
  maxAge: 86400000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
};
app.use(session(CONFIG, app)); //此时，产生sessionid，并setcookie（id，'...'）
app.use(cors({
  origin: 'http://localhost:8190',// 如果为*就是通配，写明详细url才行, 这是允许访问接口的客户端地址，就是允许跨域访问的客户端地址
  credentials: true, //将凭证暴露出来, 前端才能获取cookie
  allowMethods: ['GET', 'POST', 'DELETE', 'PUT'],
  exposeHeaders: ['Authorization'], // 将header字段expose出去，前端才能获取该header字段
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'] // 允许添加到header的字段
}));
app.use(parameter(app));
app.use(bouncer.middleware());
app.use(
  koaBody({
    multipart: true, // 支持文件上传
    formidable: {
      uploadDir: path.join(__dirname, "static/upload/"), // 设置文件上传目录
      keepExtensions: true,
      maxFieldsSize: 2 * 1024 * 1024, // 最大文件为2兆
      onFileBegin: (name, file) => {
        // 最终要保存到的文件夹目录
        const dir = path.join(__dirname, `static/upload`);
        // 重新覆盖 file.path 属性
        file.path = `${dir}/${file.name}`;
      },
    },
  })
);
app.use(static(__dirname, "static"));
// 添加token 验证中间件
app.use(verifyToken);

// routes
const routers = require("./router");
app.use(routers.routes()).use(routers.allowedMethods());

app.on("error", (err, ctx) => {
  console.log("server error", err);
});

// 设置端口监听
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
