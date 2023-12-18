import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import {
  validPhone,
  validateEmail,
  validatePass,
} from "../utils/validation.js";
import envconfig from "../config/envConfig.js";
import transporter from "../middleware/emailConfig.js";
const userRegister = async (req, res) => {
  try {
    const { fullName, email, password, phone, userName, userType } = req.body;
    if (!fullName || !email || !password || !phone || !userName || !userType) {
      return res.status(404).json({ message: "All files are required" });
    }
    // validation for email
    const isvalidEmail = validateEmail(email);
    if (!isvalidEmail) {
      return res.status(404).json({ message: "Please enter valid email" });
    }
    // validation form pass
    const isvalidPass = validatePass(password);
    if (!isvalidPass) {
      return res.status(404).json({ message: "Please enter valid password" });
    }
    // validation for phone number
    const isvalidPhone = validPhone(phone);
    if (!isvalidPhone) {
      return res.status(404).json({ message: "Please enter valid phone" });
    }
    const findUserEmail = await User.findOne({ email });
    if (findUserEmail) {
      return res.status(402).json({
        message: "This email is already in use,please try different email",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newDoc = new User({
      fullName,
      email,
      password: hashPassword,
      phone,
      userName,
      userType,
    });
    const saveuser = newDoc.save();
    if (saveuser) {
      return res.status(200).json({ message: "User register successfully" });
    } else {
      return res.status(400).json({ message: "User not register" });
    }
  } catch (error) {
    console.error("Error in user registration");
    return res.status(500).json({ message: "Error in user registration" });
  }
};
// login api
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "user not found" });
    }
    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(404).json({ message: "invalid credentials" });
    }
    const token = Jwt.sign(
      { id: existingUser, email: existingUser.email },
      envconfig.SECRET_KEY
    );
    const dataUser = token;
    return res.status(200).json({ message: "logon successfully", dataUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "something went wrong" });
  }
};
const getAllUser = async (req, res) => {
  try {
    const getUsers = await User.find({});
    if (!getUsers) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json({ message: "User found", getUsers });
    }
  } catch (error) {
    console.error("Error in get users", error);
    return res.status(500).json({ message: "Error in get users", error });
  }
};
const deleteUser = async (req, res) => {
  try {
    const delUser = await User.findByIdAndDelete(req.params.id);
    if (!delUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(500).json(delUser);
    }
  } catch (error) {
    console.error("Error", error);
    return res.status(500).json({ message: "Error in delete users", error });
  }
};
const getUserId = async (req, res, next) => {
  try {
    const getUser = await User.findById(req.params.id);
    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json({ message: "User found", getUser });
    }
  } catch {
    console.error("Error", error);
    return res.status(500).json({ message: "Error in get users", error });
  }
};
const updateUserById = async (req, res) => {
  try {
    let userId = req.params.id;
    let updatedEmail = req.body.email;
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { email: updatedEmail },
      { new: true }
    );
    if (!updateUser) {
      return res.status(404).json({ message: "User not update" });
    } else {
      return res.status(200).json({ message: "User update", updateUser });
    }
  } catch (error) {
    console.error("Error", error);
    return res.status(500).json({ message: "Error in update users", error });
  }
};
const sendEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Email not found", error });
      } else {
        const genToken = Jwt.sign({ _id: user._id }, envconfig.SECRET_KEY, {
          expiresIn: "1h",
        });
        const link = `http://localhost:3000/reset-password/?token=${genToken}`;
        const sendMail = await transporter.sendMail({
          from: envconfig.EMAIL_USER,
          to: email,
          subject: "Reset Password",
          html: `Click here to reset your password <a href= ${link}>click here</a> `,
        });
        return res
          .status(200)
          .json({ message: "Email is sent, please check your email" });
      }
    }
  } catch (error) {
    console.error("Error", error);
    return res.status(500).json({ message: "Error in sending email", error });
  }
};
// reset password
const resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  try {
    const token = req.query.token;
    const decode = Jwt.verify(token, envconfig.SECRET_KEY);
    const user = await User.findById(decode._id);
    if (!newPassword) {
      return res.status(400).json({
        error: { message: "New password is required." },
      });
    }
    if (!confirmPassword) {
      return res.status(400).json({
        error: { message: "Confirm password is required." },
      });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(500)
        .json({ message: "New password and confirm password not match." });
    } else {
      const salt = await bcrypt.genSalt(10);
      const newHashpassword = await bcrypt.hash(newPassword, salt);
      // await User.findOneAndUpdate(user._id, { $set: {password: newHashpassword} });
      user.password = newHashpassword;
      await user.save();
      return res.status(200).json({ message: "Password Reset Successfully" });
    }
  } catch (error) {
    console.error("Error", error);
    return res.status(500).json({ message: "Error in reset password", error });
  }
};
const changePassword = async(req,res)=>{
  const {email,currentPassword,newPassword}=req.body;
  try{
    const existingUser=await User.findOne({email:email});
    if(!existingUser){
      return res.status(404).json({message:"User nor found"})
    }
    const isValid=await bcrypt.compare(currentPassword,existingUser.password);
    if(!isValid){
      return res.status(400).json({message:"Incorrect current password"})
    }
    const hashedPassword=await bcrypt.hash(newPassword,10);
    existingUser.password=hashedPassword;
    await existingUser.save();
    return res.status(200).json({message:"Password changes successfully"})
  }catch(error){
    console.error("Error in change password",error);
    return res.status(500).json({message:"Error in change password"})
  }
};
export {
  userRegister,
  getAllUser,
  deleteUser,
  getUserId,
  updateUserById,
  login,
  sendEmail,
  resetPassword,
  changePassword,
};
