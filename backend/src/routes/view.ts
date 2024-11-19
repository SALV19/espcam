import { Router } from "express";
import { getCam } from "../services/view";
const router = Router();

router.get("/", getCam);

export default router;
