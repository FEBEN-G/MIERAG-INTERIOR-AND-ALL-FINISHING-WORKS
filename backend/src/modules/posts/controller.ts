import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error";
import * as postsService from "./service";

export const listPublished = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await postsService.listPosts(true));
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await postsService.listPosts(false));
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await postsService.createPost(req.body));
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  res.json(await postsService.updatePost(req.params.postId as string, req.body));
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await postsService.deletePost(req.params.postId as string);
  res.status(204).send();
});
