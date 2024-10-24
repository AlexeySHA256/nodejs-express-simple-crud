import { PostNotFoundError, CommentNotFoundError, postData, commentData } from "./domain/service.js";
import { CommentCreateForm, CommentUpdateForm, PostCreateForm, PostsListForm, PostUpdateForm } from "./forms.js";
import validator from "validator";
import { Request, Response } from "express";
import { Post, Comment } from "./domain/models.js";
import { User } from "../users/domain/models.js";
import { PostsRepositoryI } from "./repositories.js";
import { UsersRepositoryI } from "../users/repository.js";
import { Prisma } from "@prisma/client";

interface PostsServiceI {
  listPosts: (page_size: number, page_num: number) => Promise<{ page_size: number, page_num: number, posts: Post[], pages_range: number, first_page_num: number, last_page_num: number, total_records: number }>;
  getPost: (id: number) => Promise<Post>;
  createPost: (postData: postData) => Promise<Post>;
  updatePost: (id: number, postData: Partial<postData>) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
  getComment: (id: number) => Promise<Comment>;
  createComment: (commentData: commentData) => Promise<Comment>;
  updateComment: (id: number, commentData: Partial<commentData>) => Promise<Comment>;
  deleteComment: (id: number) => Promise<void>;
  postsRepo: PostsRepositoryI;
  usersRepo: UsersRepositoryI;
}

export class PostsHandlers {
  private _service: PostsServiceI;
  constructor(service: PostsServiceI) {
    this._service = service;
  }

  listPosts = (req: Request, res: Response) => {
    const form = new PostsListForm(req.query);
    if (!form.validate()) {
      res.status(422).json({ errors: form.getErrors() });
      return
    }

    req.query.page_num = req.query.page_num || "1";
    req.query.page_size = req.query.page_size || "10";
    
    this._service
      .listPosts(+req.query.page_size, +req.query.page_num)
      .then((data) => res.render("posts/list", data))
      .catch((e: any) => res.status(500).json({ error: e }));
  };

  getPost = (req: Request, res: Response) => {
    if (!validator.isInt(req.params.id || "", { min: 1 })) {
      res.status(422).json({ error: "id must be an integer and greater than 0" });
      return
    }
    this._service
      .getPost(+req.params.id)
      .then((post) => res.render("posts/detail", { post }))
      .catch((e) => {
        if (e instanceof PostNotFoundError) {
          res.status(404).send(`<h1>${e.message}</h1>`);
          return
        }
        res.status(500).json({ error: e });
      });
  };

  _makeCtxDataForUpdatePostGet = async (postID: number): Promise<{ post: Post; authors: User[]; form: PostUpdateForm }> => {
    return this._service.postsRepo.getPost({ id: postID }).then(async (post) => {
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
      .then((post) => res.redirect(`/posts/detail/${post.id}`))
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
      .then((post) => res.redirect(`/posts/detail/${post.id}`))
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

export class PostsApiHandlers {
  private _service: PostsServiceI;
  constructor(service: PostsServiceI) {
    this._service = service;
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
      .then((post) => res.status(201).json(post))
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
      .then((comment) => res.status(201).json({ comment }))
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

