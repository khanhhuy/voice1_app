import { Router } from "express";
import { requestContext } from "@/services/requestContext";
import type { IUser } from '@shared/shared_types'

const routes = Router();

routes.get("/me", (req, res) => {
  const user = requestContext.get("user");
  
  if (!user) {
    return res.status(401).json({ error: "User not found in request context" });
  }

  const userData: IUser = {
    id: user.id,
    team_id: user.team_id,
    email: user.email,
    display_name: user.display_name,
    settings: user.settings
  };

  res.json(userData);
});

export { routes };