import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from "../config/config.js";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minLength: 3,
    maxLength: 15
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minLength: 6,
    maxLength: 60
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1726065235203-4368c41c6f19?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  refreshToken: {
    type: [String],
    default: []
  },
  selectedInterests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest"
    }
  ]
  
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    },
    config.JWT_access_SECRET,
    { expiresIn: config.accessexpiresIn }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    },
    config.JWT_REFERESH_SECRET,
    { expiresIn: config.REFERESHexpiresIn }
  );
};

export default mongoose.model("User", userSchema);
