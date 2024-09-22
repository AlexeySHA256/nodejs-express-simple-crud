import { query, param, body } from "express-validator";
import PostsService from "./service.js";

class PostsHandlers {
  constructor() {
    this.service = new PostsService();
  }

  pageNumValidation() {
    return query("page_num")
      .isInt({ min: 1 })
      .withMessage("limit must be an integer and greater than 0")
      .default(1);
  }

  pageSizeValidation() {
    return query("page_size")
      .isInt({ min: 1 })
      .withMessage("page_size must be an integer and greater than 0")
      .default(10);
  }

  paginationValidation() {
    return [this.pageNumValidation(), this.pageSizeValidation()];
  }

  idParamValidation() {
    return param("id")
      .isInt({ min: 1 })
      .withMessage("id must be an integer and greater than 0");
  }

  postTitleValidation() {
    return body("title")
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("title should be between 3 and 20 characters");
  }

  postBodyValidation() {
    return body("body")
      .trim()
      .isLength({ min: 10, max: 300 })
      .withMessage("body should be between 10 and 300 characters");
  }

  postAuthorIDValidation() {
    return body("author_id")
      .isInt({ min: 1 })
      .withMessage("author_id must be an integer and greater than 0");
  }

  postValidation() {
    return [
      this.postTitleValidation(),
      this.postBodyValidation(),
      this.postAuthorIDValidation(),
    ];
  }

  listPosts = (req, res) => {
    this.service
      .listPosts(req.query.page_size, req.query.page_num)
      .then((data) => res.render("posts/list", data))
      .catch((e) => res.status(500).json({ error: e }));
  };

  getPost = (req, res) => {
    this.service
      .getPost(req.params.id)
      .then((data) => res.render("posts/detail", data))
      .catch((e) => res.status(500).json({ error: e }));
  };

  updatePostGet = (req, res) => {
    this.service
      .updatePostGet(req.params.id)
      .then((data) => res.render("posts/update", data))
      .catch((e) => res.status(500).json({ error: e }));
  };

  updatePost = (req, res) => {
    this.service
      .updatePost(req.params.id, req.body)
      .then((data) => res.redirect(`/posts/${req.params.id}`))
      .catch((e) => res.status(500).json({ error: e }));
  };
}

export default new PostsHandlers();
