import { Router } from "express";
import user from "../controllers/user.controller.js";
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

router.route('/register').post(user.registerUser)
router.route('/login').post(user.loginUser)
router.route('/logout').post(verifyJWT,user.logoutUser)
router.route('/changePassword').post(verifyJWT,user.changeUserPassword)
router.route('/currentUser').get(verifyJWT,user.getCurrentUser)


router.route('/updateEducationDetails').post(verifyJWT,user.updateEducationDetails)
router.route('/updateExperienceDetails').post(verifyJWT,user.updateExperienceDetails)
router.route('/updateSkillsDetails').post(verifyJWT,user.updateSkillsDetails)
router.route('/updateAchievementDetails').post(verifyJWT,user.updateAchievements)

router.route('/updateProfile').post(verifyJWT,upload.single("avatar"),user.updateProfile)
router.route('/submitMentorRequest').post(verifyJWT, user.submitMentorRegistrationForm)
router.route('/getUserByusername/:username').get(user.getUserByusername)


export default router;