import { Express, Request, Response, Router } from "express";
import Authorize from "../Middlewares/Authorize";
import { UserClaims, UserModel } from "../Models/UserModel";
import UserRepository, * as user_repo from "../Repositories/UserRepository";

const UserController = async (app: Express): Promise<void> => {
  const router = Router();

  router.get("/test", async (req: Request & UserClaims, res: Response) => {
    res.json("20/05/2024 04:45 am - The app is running" + __dirname);
  });

  router.post("/login", async (req: Request & UserClaims, res: Response) => {
    res.json(await user_repo.loginUser(req.body));
  });

  router.post(
    "/currentUser",
    Authorize(),
    async (req: Request & UserClaims, res: Response) => {
      res.json(await user_repo.currentUser(req.user_id));
    }
  );

  router.post(
    "/changeAdminPassword",
    Authorize(),
    async (req: Request & UserClaims, res: Response) => {
      const payload: UserModel = req.body;
      payload.user_id = req.user_id;
      res.json(await UserRepository.changeAdminPassword(payload));
    }
  );

  router.post(
    "/getUserLogs",
    Authorize(),
    async (req: Request & UserClaims, res: Response) => {
      res.json(await UserRepository.getUserLogs(parseInt(req.user_id)));
    }
  );

  router.post(
    "/getAllLogs",
    Authorize(),
    async (req: Request & UserClaims, res: Response) => {
      res.json(await UserRepository.getAllLogs());
    }
  );

  router.post(
    "/getUserNotif",
    Authorize(),
    async (req: Request & UserClaims, res: Response) => {
      res.json(await UserRepository.getUserNotif(parseInt(req.user_id)));
    }
  );

  router.post(
    "/checkUserNotif",
    Authorize(),
    async (req: Request & UserClaims, res: Response) => {
      res.json(await UserRepository.checkUserNotif(req.body.notif_user_pk));
    }
  );

  app.use("/api/users/", router);
};

export default UserController;
