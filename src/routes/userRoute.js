import {
    userRegister,
    getAllUser,
    deleteUser,
    getUserId,
    updateUserById,
    login,
    sendEmail,
    resetPassword,
    changePassword
  } from "../controller/userController.js";
  import express from "express";
  import { verifyToken } from "../middleware/verifyToken.js";
  const router = express();
  router.post("/register", userRegister);
  router.get("/getAllUsers",  getAllUser);
  router.delete("/deleteUser/:id",verifyToken, deleteUser);
  router.get("/getUserId/:id",verifyToken, getUserId);
  router.put("/updateUserById/:id",verifyToken, updateUserById);
  router.post("/login",login);
  router.post('/send-mail', sendEmail)
  router.post('/reset-password', resetPassword)
  router.post('/changePassword',changePassword)
  export default router;