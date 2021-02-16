const mongoose = require("../db/connect");
let { Schema, model } = mongoose;
// 用户
const userSchema = new Schema({
  username: String,
  nickname: String,
  password: String,
  avatar: String,
  createTime: {
    type: Date,
    default: Date.now,
  },
});

// 文章
const articleSchema = new Schema({
  uid: {
    type: String,
    required: true,
  },
  cid: { type: Schema.Types.ObjectId, ref: "category", require: true },
  title: String,
  description: String,
  content: String,
  createTime: {
    type: Date,
    default: Date.now,
  },
});

// 分类
const categorySchema = new Schema({
  title: String,
  articleCount: Number,
});

// 评论
const commentSchema = new Schema({
  commentId: { type: Schema.Types.ObjectId, ref: "user", require: true }, //评论人
  aid: { type: String, require: true }, //文章id
  content: String,
  createTime: {
    type: Date,
    default: Date.now,
  },
});

// 回复
// 回复表 业务场景是 不管对评论表进行回复还是对回复进行回复 它都属于评论表下的子集  不会出现子子孙孙这种属性结构
const replySchema = new Schema({
  // commentId和type来区分该条回复是针对评论进行回复 还是针对回复进行回复
  commentId: String,
  type: String, // 1-回复评论 2-回复回复
  content: String,
  from: { type: Schema.Types.ObjectId, ref: "user", require: true }, //回复人
  to: { type: Schema.Types.ObjectId, ref: "user", require: true }, //目标用户
  createTime: {
    type: Date,
    default: Date.now,
  },
});

// 收藏
const collectSchema = new Schema({
  uid: String, //用户id
  aid: String, //文章id,
  status: Boolean,
  created: {
    type: Date,
    default: Date.now,
  },
});

// 点赞
const likeSchema = new Schema({
  uid: { type: String, require: true }, //用户id
  typeId: { type: String, require: true },
  type: String, //点赞类型 1-文章 2-评论 3-回复
  status: Boolean, //点赞状态
  createTime: {
    type: Date,
    default: Date.now,
  },
});

exports.UserModel = model("user", userSchema);
exports.ArticleModel = model("article", articleSchema);
exports.CategoryModel = model("category", categorySchema);
exports.CommentModel = model("comment", commentSchema);
exports.ReplyModel = model("reply", replySchema);
exports.CollectModel = model("collect", collectSchema);
exports.LikeModel = model("like", likeSchema);
