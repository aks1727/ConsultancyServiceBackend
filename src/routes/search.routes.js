import searches from "../controllers/search.controller.js";
import { Router } from "express"

const router = Router()


router.route('/searchMentors').get(searches.searchMentors)


export default router