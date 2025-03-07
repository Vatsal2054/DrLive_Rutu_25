import Router from 'express';
import {addReport,getReportsByUser} from '../controller/report.controller.js';
import { isAuthenticated } from "../middleware/auth.middleware.js";
const router = Router();

// Route to add a new report
router.post('/add',isAuthenticated, addReport);

router.get('/getReports',isAuthenticated,getReportsByUser);



export default router;

