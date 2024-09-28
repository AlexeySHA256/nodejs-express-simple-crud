import { query, param, body } from "express-validator";
import { isValidationFailed } from "../utils/helpers.js";
import { PostsService, PostNotFoundError } from "./service.js";
import { PostCreateForm, PostUpdateForm } from "./forms.js";

class PostsHandlers {
  constructor() {
    this._service = new PostsService();
  }

  pageNumValidation() {
    return query("page_num")
      .default(1)
      .isInt({ min: 1 })
      .withMessage("page_num must be an integer and greater than 0");
  }

  pageSizeValidation() {
    return query("page_size")
      .default(10)
      .isInt({ min: 1 })
      .withMessage("page_size must be an integer and greater than 0");
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
    if (isValidationFailed(req, res)) {
      return;
    }
    this._service
      .listPosts(req.query.page_size, req.query.page_num)
      .then((data) => res.render("posts/list", data))
      .catch((e) => res.status(500).json({ error: e }));
  };

  getPost = (req, res) => {
    if (isValidationFailed(req, res)) {
      return;
    }
    this._service
      .getPost(req.params.id)
      .then((data) => res.render("posts/detail", data))
      .catch((e) => {
        if (e instanceof PostNotFoundError) {
          return res.status(404).send(`<h1>${e.message}</h1>`);
        }
        res.status(500).json({ error: e });
      });
  };

  updatePostGet = (req, res) => {
    if (isValidationFailed(req, res)) {
      return;
    }
    this._service
      .updatePostGet(req.params.id)
      .then((data) => res.render("posts/update", data))
      .catch((e) => {
        if (e instanceof PostNotFoundError) {
          return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: e });
      });
  };

  updatePost = (req, res) => {
    if (isValidationFailed(req, res)) {
      return;
    }
    this._service
      .updatePost(req.params.id, req.body)
      .then((data) => res.redirect(`posts/detail/${data.post.id}`))
      .catch((e) => res.status(500).json({ error: e }));
  };

  createPostGet = (req, res) => {
    if (isValidationFailed(req, res)) {
      return;
    }
    this._service
      .createPostGet()
      .then((data) => {
        data.form = new PostCreateForm();
        res.render("posts/create", data);
      })
      .catch((e) => res.status(500).json({ error: e }));
  };

  createPost = (req, res) => {
    const form = new PostCreateForm(req.body);
    if (!form.validate()) {
      return this._service.repo.listAuthors(100).then((authors) => {
        res.status(422).render("posts/create", { form, authors });
      });
    }
    this._service
      .createPost(req.body)
      .then((data) => res.redirect(`/posts/detail/${data.post.id}`))
      .catch((e) => res.status(500).json({ error: e }));
  };

  deletePostGet = (req, res) => {
    if (isValidationFailed(req, res)) {
      return;
    }
    res.render("posts/delete", { postID: req.params.id });
  };

  deletePost = (req, res) => {
    if (isValidationFailed(req, res)) {
      return;
    }
    this._service
      .deletePost(req.params.id)
      .then(() => res.redirect("/posts/"))
      .catch((e) => {
        if (e instanceof PostNotFoundError) {
          return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: e });
      });
  };
}

export default new PostsHandlers();
