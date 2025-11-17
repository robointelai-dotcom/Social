import { Request, Response } from "express";
import { Task } from "./task.model";
import { GeelarkAPI } from "@/common/platform-api/geelark.serivce";
import { Post } from "@/post/post.model";
import { NotFound } from "@/common/custom-error";

const geelarkApi = new GeelarkAPI();

export const allTasks = async (_: Request, res: Response) => {
  const tasks = await Task.find({}, { __v: 0 })
  res.json(tasks);
};

export const queryTasks = async (_: Request, res: Response) => {
  const localTasks = await Task.find({}, { taskId: 1 });

  if (!localTasks || !localTasks.length || localTasks.length === 0) {
    throw new NotFound(`No tasks found`);
  }

  const taskIds = localTasks.map(t => t.taskId);
  const tasks = await geelarkApi.queryTasks(taskIds);
  res.json(tasks);
};

export const cancelTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const response = await geelarkApi.cancelTask(taskId);

  if (response.code === 0) {
    // delete in the local db as well
    await Task.deleteOne({ taskId });
    await Post.deleteOne({ taskId });
  }

  res.json({
    msg: "Task cancelled successfully",
    data: response
  });
};


export const retryTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const response = await geelarkApi.retryTask(taskId);

  res.json({
    msg: "Task retried successfully",
    data: response
  });
};
