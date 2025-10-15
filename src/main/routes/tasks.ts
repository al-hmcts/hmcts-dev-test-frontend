import { Application, Request, Response, NextFunction } from "express";
import { TaskRequest } from "../models/request/TaskRequest";

// Retrieve task client setup from middleware
function getTaskClient(req: Request) {
  return (req as any).clients?.tasks;
}

// Auth gate for routes that require a session token
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = (req.session as any).authToken;
  if (!token) {
    return res.redirect("/"); // not logged in → go to login/home
  }
  next();
}

export default function (app: Application): void {
  // View all tasks
  app.get("/tasks", requireAuth, async (req, res, next) => {
    try {
      const taskClient = getTaskClient(req);
      const tasks = await taskClient.fetchTasks();
      res.render("all-tasks", { items: tasks });
    } catch (err) {
      next(err);
      res.render('error', {});
    }
  });

  // Add form (GET)
  app.get("/add-task", requireAuth, (req, res) => {
    res.render("add-task", { task: {}, errors: [] });
  });

  // Add form (POST)
  app.post("/add-task", requireAuth, async (req, res, next) => {
    try {
      const taskRequest = TaskRequest.fromForm(req.body);

      if (taskRequest.hasErrors()) {
        return res.status(400).render("add-task", {
          task: req.body,
          errors: taskRequest.errors,
        });
      }

      const taskClient = getTaskClient(req);
      await taskClient.createTask(taskRequest);
      res.redirect("/tasks");
    } catch (err) {
      next(err);
      res.render('error', {});
    }
  });

  // Edit form (GET)
  app.get("/tasks/:id/edit", requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const taskClient = getTaskClient(req);
      const task = await taskClient.fetchTaskById(id);
      res.render("add-task", { task, errors: [] });
    } catch (err) {
      next(err);
      res.render('error', {});
    }
  });

  // Edit form (POST)
  app.post("/tasks/:id/edit", requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const taskRequest = TaskRequest.fromForm(req.body);

      if (taskRequest.hasErrors()) {
        return res.status(400).render("add-task", {
          task: { ...req.body, id },
          errors: taskRequest.errors,
        });
      }

      const taskClient = getTaskClient(req);
      await taskClient.updateTask(id, taskRequest);
      res.redirect("/tasks");
    } catch (err) {
      next(err);
      res.render('error', {});
    }
  });

  // Delete confirmation page (GET)
  app.get("/tasks/:id/delete", requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const taskClient = getTaskClient(req);
      const task = await taskClient.fetchTaskById(id);
      res.render("delete-task", { task });
    } catch (err) {
      next(err);
      res.render('error', {});
    }
  });

  // Delete (POST)
  app.post("/tasks/:id/delete", requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const taskClient = getTaskClient(req);
      await taskClient.deleteTask(id);
      res.redirect("/tasks");
    } catch (err) {
      next(err);
      res.render('error', {});
    }
  });
}
