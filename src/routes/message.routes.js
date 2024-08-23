import { Router } from 'express'
import messageControllers from '../controllers/message.controllers.js';
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route('/sendMessage').post(verifyJWT,messageControllers.sendMessage)
router.route('/allMessages/:chatId').get(verifyJWT,messageControllers.allMessages)

export default router;