import { Post, Comment } from "./models.js";

export interface PostCreateData {
  title: string;
  body: string;
  authorId: number;
}

export interface PostsStorageI {
  countPosts(): Promise<number>;
  paginatedListPosts(limit: number, offset: number): Promise<Post[]>;
  getPost(options: {
    id: number;
    withAuthor?: boolean;
    withComments?: boolean;
  }): Promise<Post>;
  updatePost(id: number, data: Post): Promise<Post>;
  deletePost(id: number): Promise<void>;
  createPost(data: PostCreateData): Promise<Post>;
}

export interface CommentCreateData {
  title: string;
  content: string;
  authorId: number;
  postId: number;
  imageUrl?: string;
}

export interface CommentsStorageI {
  createComment(data: CommentCreateData): Promise<Comment>;
  getComment(options: {
    id: number;
    withAuthor?: boolean;
    withPost?: boolean;
  }): Promise<Comment>;
  listComments(filters: { [key: string]: any }): Promise<Comment[]>;
  updateComment(id: number, data: Comment): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
}
