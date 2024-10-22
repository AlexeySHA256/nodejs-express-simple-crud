import { PostsService, PostNotFoundError, CommentNotFoundError } from "./domain/service.js";
import { CommentCreateForm, CommentUpdateForm, PostCreateForm, PostUpdateForm } from "./forms.js";
import validator from "validator";
import { Request, Response } from "express";
import { Post } from "./domain/models.js";
import { User } from "../users/domain/models.js";
import { serverUrl } from "../server.js";

class PostsHandlers {
  private _service!: PostsService;
  constructor() {
    this._service = new PostsService();
  }

  listPosts = (req: Request, res: Response) => {
    req.query.page_num = req.query.page_num || "1";
    req.query.page_size = req.query.page_size || "10";
    const validationErrors: { [key: string]: string } = {}
    if (!validator.isInt(String(req.query.page_num), { min: 1 })) {
      validationErrors.page_num = "page_num must be an integer and greater than 0";
    }
    if (!validator.isInt(String(req.query.page_size), { min: 1 })) {
      validationErrors.page_size = "page_size must be an integer and greater than 0";
    }

    if (Object.keys(validationErrors).length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }
    this._service
      .listPosts(+req.query.page_size, +req.query.page_num)
      .then((data: any) => res.render("posts/list", data))
      .catch((e: any) => res.status(500).json({ error: e }));
  };

  getPost = (req: Request, res: Response) => {
    if (!validator.isInt(req.params.id || "", { min: 1 })) {
      res.status(422).json({ error: "id must be an integer and greater than 0" });
      return
    }
    this._service
      .getPost(+req.params.id)
      .then((data) => res.render("posts/detail", data))
      .catch((e) => {
        if (e instanceof PostNotFoundError) {
          res.status(404).send(`<h1>${e.message}</h1>`);
          return
        }
        res.status(500).json({ error: e });
      });
  };

  _makeCtxDataForUpdatePostGet = async (postID: number): Promise<{ post: Post; authors: User[]; form: PostUpdateForm }> => {
    return this._service.postsRepo.getPost(postID).then(async (post) => {
      return this._service.usersRepo.listUsers(100).then((authors) => {
        const form = new PostUpdateForm(post);
        form.fields.forEach((field) => {
          field.value = post[field.name as keyof Post];
        })
        return { post, authors, form };
      });
    });
  }

  updatePostGet = (req: Request, res: Response) => {
    if (!validator.isInt(req.params.id || "", { min: 1 })) {
      res.status(422).json({ error: "id must be an integer and greater than 0" });
      return
    }
    this._makeCtxDataForUpdatePostGet(+req.params.id)
      .then((data) => res.render("posts/update", data))
      .catch((e) => {
        if (e instanceof PostNotFoundError) {
          res.status(404).send(`<h1>${e.message}</h1>`);
          return
        }
        res.status(500).json({ error: e });
      });
  };

  updatePost = (req: Request, res: Response) => {
    const form = new PostUpdateForm(req.body);
    if (!form.validate()) {
      return this._makeCtxDataForUpdatePostGet(+req.params.id)
        .then((data) => {
          res.status(422).render("posts/update", { ...data, form: form })
        });
    }
    this._service
      .updatePost(+req.params.id, req.body)
      .then((data) => res.redirect(`/posts/detail/${data.post.id}`))
      .catch((e) => res.status(500).json({ error: e }));
  };

  createPostGet = (req: Request, res: Response) => {
    this._service.usersRepo.listUsers(100)
      .then((users) => {
        res.render("posts/create", { authors: users, form: new PostCreateForm() });
      })
      .catch((e) => res.status(500).json({ error: e }));
  };

  createPost = (req: Request, res: Response) => {
    if (!req.user) {
      res.redirect("/users/login");
      return
    }
    const form = new PostCreateForm(req.body);
    if (!form.validate()) {
      return this._service.usersRepo.listUsers(100)
        .then((users) => res.status(422).render("posts/create", { form, authors: users }));
    }
    this._service
      .createPost({ title: req.body.title, body: req.body.body, authorId: +req.body.author_id })
      .then((data) => res.redirect(`/posts/detail/${data.post.id}`))
      .catch((e) => res.status(500).json({ error: e }));
  };

  deletePostGet = (req: Request, res: Response) => {
    if (!validator.isInt(req.params.id, { min: 1 })) {
      res.status(422).json({ error: "id must be an integer and greater than 0" });
      return
    }
    res.render("posts/delete", { postID: req.params.id });
  };

  deletePost = (req: Request, res: Response) => {
    if (!validator.isInt(req.body.id, { min: 1 })) {
      res.status(422).json({ error: "post id must be an integer and greater than 0" });
      return
    }
    this._service
      .deletePost(req.body.id)
      .then(() => res.redirect("/posts/"))
      .catch((e) => {
        if (e instanceof PostNotFoundError) {
          res.status(404).send(`<h1>${e.message}</h1>`);
        } else {
          res.status(500).json({ error: e });
        }
      });
  };
}

class PostsApiHandlers {
  private _service: PostsService;
  constructor() {
    this._service = new PostsService();
  }

  createPost = (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return
    }
    const form = new PostCreateForm(req.body);
    if (!form.validate()) {
      res.status(422).json({ errors: form.getErrors() });
      return
    }
    this._service
      .createPost({ ...req.body, authorId: req.user.id })
      .then((result) => res.status(201).json(result))
      .catch((e: Error) => res.status(500).json({ error: e }));
  };

  createComment = (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return
    }
    const form = new CommentCreateForm(req.body);
    if (!form.validate()) {
      res.status(422).json({ errors: form.getErrors() });
      return
    }
    this._service
      .createComment({ ...req.body, authorId: req.user.id })
      .then((comment) => res.status(201).json(comment))
      .catch((e: Error) => {
        if (e instanceof PostNotFoundError) {
          res.status(400).json({ error: e.message });
        } else {
          res.status(500).json({ error: e })
        }
      });
  }

  getComment = (req: Request, res: Response) => {
    if (!validator.isInt(req.params.id, { min: 1 })) {
      res.status(422).json({ error: "id must be an integer and greater than 0" });
      return
    }
    this._service
      .getComment(+req.params.id)
      .then((comment) => res.json({ ...comment, authorId: undefined, postId: undefined }))
      .catch((e: Error) => {
        if (e instanceof CommentNotFoundError) {
          res.status(404).json({ error: e.message });
        } else {
          res.status(500).json({ error: e });
        }
      });
  }

  updateComment = (req: Request, res: Response) => {
    if (!validator.isInt(req.params.id, { min: 1 })) {
      res.status(422).json({ error: "id must be an integer and greater than 0" });
      return
    }
    const form = new CommentUpdateForm(req.body);
    if (!form.validate()) {
      res.status(422).json({ errors: form.getErrors() });
      return
    }
    this._service
      .updateComment(+req.params.id, {...req.body })
      .then((comment) => res.json({...comment }))
      .catch((e: Error) => {
        if (e instanceof CommentNotFoundError) {
          res.status(404).json({ error: e.message });
        } else {
          res.status(500).json({ error: e });
        }
      });
  }

  deleteComment = (req: Request, res: Response) => {
    if (!validator.isInt(req.params.id, { min: 1 })) {
      res.status(422).json({ error: "id must be an integer and greater than 0" });
      return
    }
    this._service
      .deleteComment(+req.params.id)
      .then(() => res.status(204).json({ success: true }))
      .catch((e: Error) => {
        if (e instanceof CommentNotFoundError) {
          res.status(404).json({ error: e.message });
        } else {
          res.status(500).json({ error: e });
        }
      });
  }
}

export const apiHandlers = new PostsApiHandlers();

export const handlers = new PostsHandlers();

