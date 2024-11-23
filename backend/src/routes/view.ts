import { Router } from "express";
import { getCam, getPhoto } from "../services/view";
const router = Router();

router.get("/", getCam);
router.get("/get_photo", getPhoto);

export default router;
