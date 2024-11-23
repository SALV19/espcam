import { Router } from "express";
import { getCam, borrego, welcome } from "../services/view";
const router = Router();

router.get("/", getCam);
router.get("/borrego", borrego);
router.get("/welcome", welcome);

export default router;
