class Utils {
  callbackModel(ctx, code, data, msg) {
    ctx.body = {
      code,
      data,
      msg
    };
  }
}

module.exports = new Utils;
