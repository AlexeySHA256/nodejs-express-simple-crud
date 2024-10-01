import { query, param, body } from "express-validator";
import { isValidationFailed } from "../utils/helpers.js";
import { PostsService, PostNotFoundError } from "./service.js";
import { PostCreateForm, PostUpdateForm } from "./forms.js";
import validator from "validator";

class PostsHandlers {
  constructor() {
    this._service = new PostsService();
  }

  listPosts = (req, res) => {
    req.query.page_num = req.query.page_num || 1;
    req.query.page_size = req.query.page_size || 10;
    const validationErrors = {}
    if (!validator.isInt(toString(req.query.page_num), { min: 1 })) {
      validationErrors.page_num = "page_num must be an integer and greater than 0";
    }
    if (!validator.isInt(toString(req.query.page_size), { min: 1 })) {
      validationErrors.page_size = "page_size must be an integer and greater than 0";
    }

    if (validationErrors.length > 0) {
      return res.status(422).json({ errors: validationErrors });
    }
    this._service
      .listPosts(req.query.page_size, req.query.page_num)
      .then((data) => res.render("posts/list", data))
      .catch((e) => res.status(500).json({ error: e }));
  };

  getPost = (req, res) => {
    if (!validator.isInt(req.params.id || "", { min: 1 })) {
      return res.status(422).json({ error: "id must be an integer and greater than 0" });
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
    if (!validator.isInt(req.params.id.toString() || "", { min: 1 })) {
      return res.status(422).json({ error: "id must be an integer and greater than 0" });
    }
    this._service
      .updatePostGet(req.params.id)
      .then((data) => res.render("posts/update", data))
      .catch((e) => {
        if (e instanceof PostNotFoundError) {
          return res.status(404).send(`<h1>${e.message}</h1>`);
        }
        res.status(500).json({ error: e });
      });
  };

  updatePost = (req, res) => {
    const form = new PostUpdateForm(req.body);
    if (!form.validate()) {
      return this._service
        .updatePostGet(req.params.id)
        .then((data) => {
          res.status(422).render("posts/update", { ...data, form: form })
        });
    }
    this._service
      .updatePost(req.params.id, req.body)
      .then((data) => res.redirect(`/posts/detail/${data.post.id}`))
      .catch((e) => res.status(500).json({ error: e }));
  };

  createPostGet = (req, res) => {
    this._service
      .createPostGet()
      .then((data) => res.render("posts/create", data))
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
    if (!validator.isInt(req.params.id.toString(), { min: 1 })) {
      return res.status(422).json({ error: "id must be an integer and greater than 0" });
    }
    res.render("posts/delete", { postID: req.params.id });
  };

  deletePost = (req, res) => {
    if (!validator.isInt(req.body.id.toString(), { min: 1 })) {
      return res.status(422).json({ error: "post id must be an integer and greater than 0" });
    }
    this._service
      .deletePost(req.body.id)
      .then(() => res.redirect("/posts/"))
      .catch((e) => {
        if (e instanceof PostNotFoundError) {
          return res.status(404).send(`<h1>${e.message}</h1>`);
        }
        res.status(500).json({ error: e });
      });
  };
}

class PostsApiHandlers {
  constructor() {
    this._service = new PostsService();
  }

  getListAuthors = (req, res) => {
    this._service
      .repo
      .listAuthors(100)
      .then((authors) => res.json(authors))
      .catch((e) => res.status(500).json({ error: e }));
  };

  createPost = (req, res) => {
    console.log(req, req.body);
    
    const form = new PostCreateForm(req.body);
    if (!form.validate()) {
      return res.status(422).json({ errors: form.getErrors() });
    }
    this._service
      .createPost(req.body)
      .then((result) => res.status(201).json(result))
      .catch((e) => res.status(500).json({ error: e }));
  };
}

export const apiHandlers = new PostsApiHandlers();

export const handlers = new PostsHandlers();

