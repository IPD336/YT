import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHander.js";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshToken } from "../controllers/user.controllers.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();
    const refreshToken =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    };

    // Helper function to refresh tokens and attach user
    const refreshAndAttachUser = async (userId) => {
      const user = await User.findById(userId).select(
        "-password -refreshToken"
      );
      if (!user) {
        throw new ApiError(401, "User not found");
      }

      const { accessToken: newAccess, refreshToken: newRefresh } =
        await generateAccessAndRefreshToken(user._id);

      res
        .cookie("accessToken", newAccess, options)
        .cookie("refreshToken", newRefresh, options);

      req.user = user;
      return next();
    };

    //  Case 1: Access token exists
    if (accessToken) {
      try {
        const accessDecoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
        return await refreshAndAttachUser(accessDecoded._id); // Always refresh even if valid
      } catch (err) {
        // Access token expired or invalid
        if (err.name === "TokenExpiredError") {
          if (!refreshToken) {
            throw new ApiError(
              401,
              "Access token expired and no refresh token provided"
            );
          }

          const refreshDecoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
          );
          return await refreshAndAttachUser(refreshDecoded._id);
        }

        throw new ApiError(401, err.message);
      }
    }

    //  Case 2: Access token missing, try with refresh
    if (refreshToken) {
      const refreshDecoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      return await refreshAndAttachUser(refreshDecoded._id);
    }

    //  No tokens provided
    throw new ApiError(401, "No access or refresh token provided");
  } catch (error) {
    throw new ApiError(401, "Tokens Expired Please Login again");
  }
});
