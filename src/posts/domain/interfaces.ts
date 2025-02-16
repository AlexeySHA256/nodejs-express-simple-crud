import { Prisma } from "@prisma/client";

export type IComment = Prisma.CommentGetPayload<{}>
export type ICommentExtended = Prisma.CommentGetPayload<{ include: { author: true, post: true } }>
export type IPost = Prisma.PostGetPayload<{}>
export type IPostExtended = Prisma.PostGetPayload<{ include: { author: true, comments: true } }>
export interface PostCreateData {
  title: string;
  body: string;
  authorId: number;
}
export type IPostCreateData = Prisma.PostUncheckedCreateInput

export interface PostsStorageI {
  countPosts(): Promise<number>;
  paginatedListPosts(limit: number, offset: number): Promise<IPost[]>;
  getPost(options: {
    id: number;
    withAuthor?: boolean;
    withComments?: boolean;
  }): Promise<IPostExtended>;
  updatePost(id: number, data: Partial<IPostCreateData>): Promise<IPost>;
  deletePost(id: number): Promise<void>;
  createPost(data: PostCreateData): Promise<IPost>;
}

export type ICommentCreateData = Prisma.CommentUncheckedCreateInput
// export interface CommentCreateData {
//   title: string;
//   content: string;
//   authorId: number;
//   postId: number;
//   imageUrl?: string;
// }

export interface CommentsStorageI {
  createComment(data: ICommentCreateData): Promise<IComment>;
  getComment(options: {
    id: number;
    withAuthor?: boolean;
    withPost?: boolean;
  }): Promise<ICommentExtended>;
  listComments(filters: { [key: string]: any }): Promise<IComment[]>;
  updateComment(id: number, data: Partial<ICommentCreateData>): Promise<IComment>;
  deleteComment(id: number): Promise<void>;
}
