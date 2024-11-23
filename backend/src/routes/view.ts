import { Router } from "express";
import { getCam, borrego, welcome } from "../services/view";
const router = Router();

router.get("/", getCam);
router.get("/get_photo", borrego);
router.get("/get_photo", welcome);

export default router;
