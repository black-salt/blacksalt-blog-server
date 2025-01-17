/**
 * 整合所有子路由
*/

const router = require("koa-router")();
const api = require("./api.js");

router.use("/api", api.routes(), api.allowedMethods());

module.exports = router;
