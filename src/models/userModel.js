import mongoose from "mongoose";
import express from "express";
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    require: false,
  },
  email: {
    type: String,
    require: false,
  },
  password: {
    type: String,
    require: false,
  },
  userName:{
    type: String,
    require: false,
  },
  userType:{
    type: String,
    require: false,
  },
  phone:{
    type: Number,
    require: false,
  },
});
const User = mongoose.model("User", userSchema);
export default User;