import { Express } from "express";
import config from "@/config";
import errorHandler from "@/common/middlewares/error-handler";

const mountRoutes = (app: Express) => {
  app.get("/", (_, res) => {
    res.json({
      status: 200,
      health: "✅ Good",
      msg: `Welcome to the API of ${config.APP_NAME} 🚀`,
    });
  });

  app.use("/api/v1/accounts", require("@/account/account.route").default);
  app.use("/api/v1/mobiles", require("@/mobile/mobile.route").default);
  app.use("/api/v1/posts", require("@/post/post.route").default);
  app.use("/api/v1/tasks", require("@/task/task.route").default);

  app.use("*", (_, res) => {
    res.status(404).json({
      msg: `Route not found , please check the correct path`,
    });
  });

  app.use(errorHandler);
};

export default mountRoutes;
