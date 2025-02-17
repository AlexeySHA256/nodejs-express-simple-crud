import { PostNotFoundError, CommentNotFoundError } from "./domain/services.js";
import { CommentCreateForm, CommentUpdateForm, PostCreateForm, PostsListForm, PostUpdateForm } from "./forms.js";
import validator from "validator";
import { Request, Response } from "express";
import { IUser } from "../users/domain/interfaces.js";
import { ICommentCreateData, IPost, IPostCreateData, IPostExtended, PostsStorageI } from "./domain/interfaces.js";
import { UsersStorageI } from "../users/domain/interfaces.js";
import { IPaginatedData } from "../../types/types.js";

interface PostsServiceI {
  listPosts: (page_size: number, page_num: number) => Promise<IPaginatedData<IPost>>;
  getPost: (id: number) => Promise<IPostExtended>;
  createPost: (postData: IPostCreateData) => Promise<IPost>;
  updatePost: (id: number, postData: Partial<IPostCreateData>) => Promise<IPost>;
  deletePost: (id: number) => Promise<void>;
  postsRepo: PostsStorageI;
  usersRepo: UsersStorageI;
}

interface CommentsServiceI {
  getComment: (id: number) => Promise<Comment>;
  createComment: (commentData: ICommentCreateData) => Promise<Comment>;
  updateComment: (id: number, commentData: Partial<ICommentCreateData>) => Promise<Comment>;
  deleteComment: (id: number) => Promise<void>;
  listCommentsForPost: (postId: number) => Promise<Comment[]>
}

export class PostsHandlers {
  constructor(private postsService: PostsServiceI) {
    this.postsService = postsService;
  }

  listPosts = (req: Request, res: Response) => {
    const form = new PostsListForm(req.query);
    if (!form.validate()) {
      res.status(422).json({ errors: form.getErrors() });
      return
    }

    req.query.page_num = req.query.page_num || "1";
    req.query.page_size = req.query.page_size || "10";

    this.postsService
      .listPosts(+req.query.page_size, +req.query.page_num)
      .then((data) => res.render("posts/list", data))
      .catch((e: any) => res.status(500).json({ error: e }));
  };

  getPost = (req: Request, res: Response) => {
    if (!validator.isInt(req.params.id || "", { min: 1 })) {
      res.status(422).json({ error: "id must be an integer and greater than 0" });
      return
    }
    this.postsService
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

  _makeCtxDataForUpdatePostGet = async (postID: number): Promise<{ post: IPost; authors: IUser[]; form: PostUpdateForm }> => {
    return this.postsService.postsRepo.getPost({ id: postID }).then(async (post) => {
      return this.postsService.usersRepo.listUsers(100).then((authors) => {
        const form = new PostUpdateForm(post);
        form.fields.forEach((field) => {
          field.value = post[field.name as keyof IPost];
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
        console.log(e);
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
    this.postsService
      .updatePost(+req.params.id, req.body)
      .then((post) => res.redirect(`/posts/detail/${post.id}`))
      .catch((e) => res.status(500).json({ error: e }));
  };

  createPostGet = (req: Request, res: Response) => {
    this.postsService.usersRepo.listUsers(100)
      .then((users) => {
        res.render("posts/create", { authors: users, form: new PostCreateForm() });
      })
      .catch((e) => res.status(500).json({ error: e }));
  };

  createPost = (req: Request, res: Response) => {
    const form = new PostCreateForm(req.body);
    if (!form.validate()) {
      return this.postsService.usersRepo.listUsers(100)
        .then((users) => res.status(422).render("posts/create", { form, authors: users }));
    }
    this.postsService
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
    this.postsService
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

  constructor(private postsService: PostsServiceI, private commentsService: CommentsServiceI) {
    this.postsService = postsService;
    this.commentsService = commentsService;
  }

  createPost = (req: Request, res: Response) => {
    const form = new PostCreateForm(req.body);
    if (!form.validate()) {
      res.status(422).json({ errors: form.getErrors() });
      return
    }
    this.postsService
      .createPost({ ...req.body, authorId: (res.locals.user as IUser).id })
      .then((post) => res.status(201).json(post))
      .catch((e: Error) => res.status(500).json({ error: e }));
  };

  createComment = (req: Request, res: Response) => {
    const form = new CommentCreateForm(req.body);
    if (!form.validate()) {
      res.status(422).json({ errors: form.getErrors() });
      return
    }
    this.commentsService
      .createComment({ ...req.body, authorId: (res.locals.user as IUser).id })
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
    this.commentsService
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

  listCommentsForPost = (req: Request, res: Response) => {
    if (!validator.isInt(req.params.id, { min: 1 })) {
      res.status(422).json({ error: "id must be an integer and greater than 0" });
      return
    }
    this.commentsService
      .listCommentsForPost(+req.params.id)
      .then((comments) => res.json(comments))
      .catch((e: Error) => {
        if (e instanceof PostNotFoundError) {
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
    this.commentsService
      .updateComment(+req.params.id, { ...req.body })
      .then((comment) => res.json({ ...comment }))
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
    this.commentsService
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

