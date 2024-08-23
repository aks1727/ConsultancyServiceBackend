import { Router } from 'express'
import chats from '../controllers/chats.controller.js'
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router = Router()

router.route('/accessMentorChat/:mentorId').post(verifyJWT, chats.accessMentorChat)
router.route('/accessUserChat/:userId').post(verifyJWT, chats.accessUserChat)
router.route('/fetchChatsforMentor').get(verifyJWT, chats.fetchChatsforMentor)

export default router