import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
  changeCurrentPassword,
  UpdateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

// router.post('/register',registerUser)

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/getMe").post(verifyJwt, getCurrentUser);
router.route("/change-password").post(verifyJwt, changeCurrentPassword);

router.route("/update-user").post(verifyJwt, UpdateUserDetails);
router
  .route("/update-avatar")
  .post(verifyJwt, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-coverImg")
  .post(verifyJwt, upload.single("coverImage"), updateUserCoverImage);

export default router;
