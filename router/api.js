const router = require("koa-router")();
const controller = require("../controllers");

const routers = router
  .post("/user/login", controller.user.login) // 登录
  .post("/user/register", controller.user.register) // 注册
  .get("/user", controller.user.getUserInfo) // 用户信息
  .put("/user/nickname", controller.user.updateNickname) // 用户信息
  .put("/user/avatar", controller.user.updateAvatar) // 用户头像
  .get("/captcha", controller.captcha.createCaptcha) // 验证码
  .get("/verifyCode", controller.captcha.verifyCaptcha) // 验证 验证码
  .post("/storage", controller.storage.fileUpload) // 上传资源
  .delete("/storage/:id", controller.storage.fileDelete) // 删除资源
  .get("/category", controller.article.getCategoryList) // 分类列表
  .post("/category", controller.article.createCategory) // 创建分类
  .put("/category", controller.article.updateCategory) // 修改分类
  .delete("/category/:id", controller.article.deleteCategory) // 删除分类
  .get("/article", controller.article.getArticleList) // 文章列表
  .get("/article/:id", controller.article.getArticleInfoById) // 文章详情
  .post("/article", controller.article.createArticle) // 创建文章
  .put("/article", controller.article.updateArticle) // 修改文章
  .delete("/article/:id", controller.article.deleteArticle) // 删除文章
  .post("/collect", controller.article.collectArticle) // 收藏文章
  .get("/comment", controller.article.getCommentList) // 评论列表
  .post("/comment", controller.article.addComment) // 添加评论
  .post("/reply", controller.article.addReply) // 添加回复
  .delete("/reply/:id", controller.article.deleteReply) // 删除回复
  .post("/like", controller.article.operateLike); // 点赞
// 导出路由
module.exports = routers;
