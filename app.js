const Koa = require("koa");
const cors = require("koa-cors");
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
app.use(session(CONFIG, app));
app.use(cors());
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
