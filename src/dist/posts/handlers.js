import { PostNotFoundError, CommentNotFoundError } from "./domain/service.js";
import { CommentCreateForm, CommentUpdateForm, PostCreateForm, PostsListForm, PostUpdateForm } from "./forms.js";
import validator from "validator";
export class PostsHandlers {
    _service;
    constructor(service) {
        this._service = service;
    }
    listPosts = (req, res) => {
        const form = new PostsListForm(req.query);
        if (!form.validate()) {
            res.status(422).json({ errors: form.getErrors() });
            return;
        }
        req.query.page_num = req.query.page_num || "1";
        req.query.page_size = req.query.page_size || "10";
        this._service
            .listPosts(+req.query.page_size, +req.query.page_num)
            .then((data) => res.render("posts/list", data))
            .catch((e) => res.status(500).json({ error: e }));
    };
    getPost = (req, res) => {
        if (!validator.isInt(req.params.id || "", { min: 1 })) {
            res.status(422).json({ error: "id must be an integer and greater than 0" });
            return;
        }
        this._service
            .getPost(+req.params.id)
            .then((post) => res.render("posts/detail", { post }))
            .catch((e) => {
            if (e instanceof PostNotFoundError) {
                res.status(404).send(`<h1>${e.message}</h1>`);
                return;
            }
            res.status(500).json({ error: e });
        });
    };
    _makeCtxDataForUpdatePostGet = async (postID) => {
        return this._service.postsRepo.getPost({ id: postID }).then(async (post) => {
            return this._service.usersRepo.listUsers(100).then((authors) => {
                const form = new PostUpdateForm(post);
                form.fields.forEach((field) => {
                    field.value = post[field.name];
                });
                return { post, authors, form };
            });
        });
    };
    updatePostGet = (req, res) => {
        if (!validator.isInt(req.params.id || "", { min: 1 })) {
            res.status(422).json({ error: "id must be an integer and greater than 0" });
            return;
        }
        this._makeCtxDataForUpdatePostGet(+req.params.id)
            .then((data) => res.render("posts/update", data))
            .catch((e) => {
            if (e instanceof PostNotFoundError) {
                res.status(404).send(`<h1>${e.message}</h1>`);
                return;
            }
            res.status(500).json({ error: e });
        });
    };
    updatePost = (req, res) => {
        const form = new PostUpdateForm(req.body);
        if (!form.validate()) {
            return this._makeCtxDataForUpdatePostGet(+req.params.id)
                .then((data) => {
                res.status(422).render("posts/update", { ...data, form: form });
            });
        }
        this._service
            .updatePost(+req.params.id, req.body)
            .then((post) => res.redirect(`/posts/detail/${post.id}`))
            .catch((e) => res.status(500).json({ error: e }));
    };
    createPostGet = (req, res) => {
        this._service.usersRepo.listUsers(100)
            .then((users) => {
            res.render("posts/create", { authors: users, form: new PostCreateForm() });
        })
            .catch((e) => res.status(500).json({ error: e }));
    };
    createPost = (req, res) => {
        if (!req.user) {
            res.redirect("/users/login");
            return;
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
    deletePostGet = (req, res) => {
        if (!validator.isInt(req.params.id, { min: 1 })) {
            res.status(422).json({ error: "id must be an integer and greater than 0" });
            return;
        }
        res.render("posts/delete", { postID: req.params.id });
    };
    deletePost = (req, res) => {
        if (!validator.isInt(req.body.id, { min: 1 })) {
            res.status(422).json({ error: "post id must be an integer and greater than 0" });
            return;
        }
        this._service
            .deletePost(req.body.id)
            .then(() => res.redirect("/posts/"))
            .catch((e) => {
            if (e instanceof PostNotFoundError) {
                res.status(404).send(`<h1>${e.message}</h1>`);
            }
            else {
                res.status(500).json({ error: e });
            }
        });
    };
}
export class PostsApiHandlers {
    _service;
    constructor(service) {
        this._service = service;
    }
    createPost = (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: "unauthorized" });
            return;
        }
        const form = new PostCreateForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ errors: form.getErrors() });
            return;
        }
        this._service
            .createPost({ ...req.body, authorId: req.user.id })
            .then((post) => res.status(201).json(post))
            .catch((e) => res.status(500).json({ error: e }));
    };
    createComment = (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: "unauthorized" });
            return;
        }
        const form = new CommentCreateForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ errors: form.getErrors() });
            return;
        }
        this._service
            .createComment({ ...req.body, authorId: req.user.id })
            .then((comment) => res.status(201).json({ comment }))
            .catch((e) => {
            if (e instanceof PostNotFoundError) {
                res.status(400).json({ error: e.message });
            }
            else {
                res.status(500).json({ error: e });
            }
        });
    };
    getComment = (req, res) => {
        if (!validator.isInt(req.params.id, { min: 1 })) {
            res.status(422).json({ error: "id must be an integer and greater than 0" });
            return;
        }
        this._service
            .getComment(+req.params.id)
            .then((comment) => res.json({ ...comment, authorId: undefined, postId: undefined }))
            .catch((e) => {
            if (e instanceof CommentNotFoundError) {
                res.status(404).json({ error: e.message });
            }
            else {
                res.status(500).json({ error: e });
            }
        });
    };
    updateComment = (req, res) => {
        if (!validator.isInt(req.params.id, { min: 1 })) {
            res.status(422).json({ error: "id must be an integer and greater than 0" });
            return;
        }
        const form = new CommentUpdateForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ errors: form.getErrors() });
            return;
        }
        this._service
            .updateComment(+req.params.id, { ...req.body })
            .then((comment) => res.json({ ...comment }))
            .catch((e) => {
            if (e instanceof CommentNotFoundError) {
                res.status(404).json({ error: e.message });
            }
            else {
                res.status(500).json({ error: e });
            }
        });
    };
    deleteComment = (req, res) => {
        if (!validator.isInt(req.params.id, { min: 1 })) {
            res.status(422).json({ error: "id must be an integer and greater than 0" });
            return;
        }
        this._service
            .deleteComment(+req.params.id)
            .then(() => res.status(204).json({ success: true }))
            .catch((e) => {
            if (e instanceof CommentNotFoundError) {
                res.status(404).json({ error: e.message });
            }
            else {
                res.status(500).json({ error: e });
            }
        });
    };
}
//# sourceMappingURL=handlers.js.map