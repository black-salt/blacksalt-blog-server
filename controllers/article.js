const {
  ArticleModel,
  CategoryModel,
  CommentModel,
  ReplyModel,
  CollectModel,
  LikeModel,
} = require("../models");
const { callbackModel } = require("../utils/index");
const { getUserIdByToken } = require("../middleware/token");
const { codeConfig } = require("../config");
const formatTime = require("../utils/formatTime");
// 分类
let createCategory = async (ctx) => {
  let { title } = ctx.request.body;
  if (title === "") {
    callbackModel(ctx, codeConfig.error, null, "分类标题不能为空");
    return;
  }
  let result = await CategoryModel.find({ title });
  if (result.length !== 0) {
    callbackModel(
      ctx,
      codeConfig.error,
      null,
      "该分类已经存在了，请再换一个试试吧"
    );
    return;
  }
  let category = new CategoryModel({ title });
  let res = category.save();
  if (res) {
    callbackModel(ctx, codeConfig.success, null, "创建成功");
  } else {
    ctx.status = 500;
  }
};

let getCategoryList = async (ctx) => {
  let res = await CategoryModel.find(null, "_id title");
  let result = [];
  // 计算分类id对应的文章数量
  for (let i = 0; i < res.length; i++) {
    let item = res[i];
    let articles = await ArticleModel.find({
      cid: item._id,
    });
    let map = {
      _id: item._id,
      title: item.title,
      artCount: articles.length,
    };
    result.push(map);
  }
  if (result) {
    callbackModel(ctx, codeConfig.success, result, "数据获取成功");
  } else {
    ctx.status = 500;
  }
};

let updateCategory = async (ctx) => {
  let { id, title } = ctx.request.body;
  if (title === "") {
    callbackModel(ctx, codeConfig.error, null, "分类标题不能为空");
    return;
  }
  let result = await CategoryModel.find({ title });
  if (result.length !== 0) {
    callbackModel(
      ctx,
      codeConfig.error,
      null,
      "该分类已经存在了，请再换一个试试吧"
    );
    return;
  }
  let res = await CategoryModel.findOneAndUpdate(
    { _id: id },
    {
      $set: { title },
    },
    { new: true }
  );
  if (res) {
    callbackModel(ctx, codeConfig.success, null, "修改成功");
  } else {
    ctx.status = 500;
  }
};

let deleteCategory = async (ctx) => {
  let _id = ctx.params.id;
  let getArticlesByCid = await ArticleModel.find({ cid: _id });
  if (getArticlesByCid.length > 0) {
    callbackModel(ctx, codeConfig.error, null, "该分类下还有文章");
  } else {
    let res = await CategoryModel.findByIdAndRemove(_id);
    if (res) {
      callbackModel(ctx, codeConfig.success, null, "删除成功");
    } else {
      ctx.status = 500;
      callbackModel(ctx, codeConfig.error, null, "删除失败，服务器异常");
    }
  }
};

// 文章
let getArticleList = async (ctx) => {
  let pageSize = 10; // 每页数量
  let pageNum = ctx.query.pageNum; // 当前页码
  let options = {
    skip: Number((pageNum - 1) * pageSize),
    limit: Number(pageSize),
  };
  let res = await ArticleModel.find({}, null, options).populate(
    "cid",
    "-_id title"
  );
  if (res) {
    let newArr = res.map((item) => {
      return {
        id: item._id,
        title: item.title,
        content: item.content,
        category: item.cid ? item.cid.title : "",
        description: item.description,
        created: formatTime(item.createTime),
      };
    });
    let total = await ArticleModel.countDocuments();
    callbackModel(
      ctx,
      codeConfig.success,
      {
        totalSize: total,
        data: newArr,
      },
      ""
    );
  } else {
    ctx.status = 500;
  }
};

let getArticleInfoById = async (ctx) => {
  let token = ctx.get("Authorization").split(" ")[1];
  let uid = await getUserIdByToken(token); //解析用户
  let aid = ctx.params.id;
  let res = await ArticleModel.findById({ _id: aid }).populate("cid", "title");
  let collect = await CollectModel.findOne({ uid, aid }, "status");
  let collects = await CollectModel.find({ aid });
  let like = await LikeModel.findOne({ uid, typeId: aid }, "status");
  let likes = await LikeModel.find({ typeId: aid });
  if (res) {
    let { _id: id, cid, title, description, content, createTime } = res;
    callbackModel(
      ctx,
      codeConfig.success,
      {
        id,
        title,
        description,
        content,
        cid: cid ? cid._id : null,
        category: cid ? cid.title : "",
        isCollect: collect ? collect.status : false,
        collectCount: collects ? collects.length : 0,
        isLike: like ? like.status : false,
        likeCount: likes ? likes.length : 0,
        createTime: formatTime(createTime),
      },
      "查询成功"
    );
  } else {
    ctx.status = 500;
  }
};

let createArticle = async (ctx) => {
  let token = ctx.get("Authorization").split(" ")[1];
  let _id = await getUserIdByToken(token); //解析用户
  const { title, categoryId, description, content } = ctx.request.body;
  if (title === "") {
    callbackModel(ctx, codeConfig.error, null, "文章标题不能为空");
    return;
  }
  if (categoryId === "") {
    callbackModel(ctx, codeConfig.error, null, "请选择一个文章分类");
    return;
  }
  if (description === "") {
    callbackModel(ctx, codeConfig.error, null, "文章描述不能为空");
    return;
  }
  if (content === "") {
    callbackModel(ctx, codeConfig.error, null, "文章内容不能为空");
    return;
  }
  let article = new ArticleModel({
    uid: _id,
    title,
    cid: categoryId,
    description,
    content,
  });
  let res = await article.save();
  if (res) {
    callbackModel(ctx, codeConfig.success, null, "文章创建成功");
  } else {
    ctx.status = 500;
  }
};

let updateArticle = async (ctx) => {
  let { id, title, categoryId, description, content } = ctx.request.body;
  let res = await ArticleModel.findOneAndUpdate(
    { _id: id },
    {
      $set: { title, cid: categoryId, description, content },
    },
    { new: true }
  );
  if (res) {
    callbackModel(ctx, codeConfig.success, null, "修改成功");
  } else {
    ctx.status = 500;
  }
};

let deleteArticle = async (ctx) => {
  let _id = ctx.params.id;
  let res = await ArticleModel.findByIdAndRemove(_id);
  if (res) {
    callbackModel(ctx, codeConfig.success, null, "删除成功");
  } else {
    ctx.status = 500;
  }
};

// 收藏
let collectArticle = async (ctx) => {
  let token = ctx.get("Authorization").split(" ")[1];
  let uid = await getUserIdByToken(token); //解析用户
  let { aid, status } = ctx.request.body;
  let result = await CollectModel.findOne({ uid, aid });
  if (!result) {
    let collect = new CollectModel({
      uid,
      aid,
      status,
    });
    let res = await collect.save();
    if (res) {
      callbackModel(ctx, codeConfig.success, null, "收藏成功");
    } else {
      ctx.status = 500;
    }
  } else {
    let collectFlag = result.status;
    if (collectFlag === status) {
      callbackModel(ctx, codeConfig.error, null, status ? "已收藏" : "未收藏");
    }
    let doc = await CollectModel.findOneAndUpdate(
      { uid, aid },
      { $set: { status } },
      { new: true }
    );
    if (doc) {
      callbackModel(
        ctx,
        codeConfig.success,
        null,
        status ? "已收藏" : "取消收藏"
      );
    }
  }
};

// 评论
let getCommentList = async (ctx) => {
  let token = ctx.get("Authorization").split(" ")[1];
  let accountId = await getUserIdByToken(token); //解析用户
  let { aid } = ctx.query;
  let article = await ArticleModel.findById({ _id: aid });
  // 连表查询
  let res = await CommentModel.find({ aid }).populate(
    "commentId",
    "nickname avatar"
  );
  if (res) {
    let tempArr = [];
    for (let i = 0; i < res.length; i++) {
      let item = res[i];
      let { _id: id, content, commentId } = item;
      let { _id: userId, nickname, avatar } = commentId;
      let isAuthor = userId == article.uid; //此处不能使用严格相同===,否则会一直是false
      let replyList = await ReplyModel.find({ commentId: id }).populate(
        "from to",
        "nickname avatar"
      );
      let like = await LikeModel.findOne({ uid: accountId, typeId: id });
      let likes = await LikeModel.find({ typeId: id, status: true });
      let map = {};
      map["id"] = id;
      map["content"] = content;
      map["avatar"] = avatar;
      map["nickname"] = nickname;
      map["uid"] = userId;
      map["isAuthor"] = isAuthor;
      map["isLike"] = like ? like.status : false;
      map["likeCount"] = likes.length;
      map["comments"] = [...replyList];
      map["createTime"] = formatTime(item.createTime);
      tempArr.push(map);
    }
    callbackModel(ctx, codeConfig.success, tempArr, "查询成功");
  } else {
    ctx.status = 500;
  }
};

let addComment = async (ctx) => {
  let token = ctx.get("Authorization").split(" ")[1];
  let commentId = await getUserIdByToken(token); //解析用户
  let { aid, content } = ctx.request.body;
  if (content === "") {
    callbackModel(ctx, codeConfig.error, null, "评论内容不能为空");
    return;
  }
  let comment = new CommentModel({
    commentId,
    aid,
    content,
  });
  let res = await comment.save();
  if (res) {
    callbackModel(ctx, codeConfig.success, null, "添加评论成功");
  } else {
    ctx.status = 500;
  }
};

// 回复
let addReply = async (ctx) => {
  let token = ctx.get("Authorization").split(" ")[1];
  let from_userId = await getUserIdByToken(token); //解析用户
  let { commentId, type, to, content } = ctx.request.body;
  let reply = new ReplyModel({
    commentId,
    type,
    content,
    from: from_userId,
    to,
  });
  let res = await reply.save();
  if (res) {
    callbackModel(ctx, codeConfig.success, null, "评论成功");
  } else {
    ctx.status = 500;
  }
};

let deleteReply = async (ctx) => {
  let _id = ctx.params.id;
  let res = await ReplyModel.findByIdAndRemove(_id);
  if (res) {
    callbackModel(ctx, codeConfig.success, null, "删除成功");
  } else {
    ctx.status = 500;
  }
};

// 点赞
let operateLike = async (ctx) => {
  let token = ctx.get("Authorization").split(" ")[1];
  let uid = await getUserIdByToken(token); //解析用户
  let { type, typeId, status } = ctx.request.body;
  let result = await LikeModel.findOne({ uid, typeId }, "status");
  if (!result) {
    let like = new LikeModel({
      uid,
      type,
      typeId,
      status,
    });
    let res = await like.save();
    if (res) {
      callbackModel(ctx, codeConfig.success, null, "点赞成功");
    } else {
      ctx.status = 500;
    }
  } else {
    let likeFlag = result.status;
    if (likeFlag === status) {
      callbackModel(ctx, codeConfig.error, null, status ? "已点赞" : "未点赞");
    }
    let doc = await LikeModel.findOneAndUpdate(
      { uid, typeId },
      { $set: { status } },
      { new: true }
    );
    if (doc) {
      callbackModel(
        ctx,
        codeConfig.success,
        null,
        status ? "已点赞" : "取消点赞"
      );
    }
  }
};

module.exports = {
  createCategory,
  getCategoryList,
  updateCategory,
  deleteCategory,
  createArticle,
  updateArticle,
  getArticleList,
  getArticleInfoById,
  deleteArticle,
  collectArticle,
  getCommentList,
  addComment,
  addReply,
  deleteReply,
  operateLike,
};
