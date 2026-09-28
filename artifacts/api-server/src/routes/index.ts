import { Router, type IRouter } from "express";
import healthRouter from "./health";
import murderMysteriesRouter from "./murderMysteries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(murderMysteriesRouter);

export default router;
