import { query, param } from "express-validator";
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

  list = (req, res) => {
    this.service
      .list(req.query.page_size, req.query.page_num)
      .then((data) => res.render("posts/list", data))
      .catch((e) => res.status(500).json({ error: e }));
  };

  getPost = (req, res) => {
    this.service
      .getPost(req.params.id)
      .then((data) => res.render("posts/detail", data))
      .catch((e) => res.status(500).json({ error: e }));
  };
}

export default new PostsHandlers();
