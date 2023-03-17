/**
 * @file userControllers.js
 * @description This file contains the controllers for the user model.
 * Author: Ayobami Adebesin
 * @requires express-async-handler
 * @requires UserModel
 * @requires generateToken
 * @exports registerUser
 * @exports authUser
 */

const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const generateToken = require("../config/generateToken");

class userControllers {
  /**
   * @desc    Register a new user
   * @route   POST "/"
   * @access  Public
   * @param   {Object} req - The request object
   * @param   {Object} res - The response object
   * @returns {Object} - Returns a json object with the user's id, name, email, and token
   * @throws  {Error} - Throws an error if the user already exists
   * @throws  {Error} - Throws an error if the user could not be created
   * @throws  {Error} - Throws an error if the user's name, email, or password is not provided
   */
  static async registerUser(req, res) {
    const { name, email, password, pic } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please fill all fields");
    }
    const userExists = await User.findOne({ email });
    // Check if user exists
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    } else {
      // Create this user and save to db
      const user = await User.create({
        name: name,
        email: email,
        password: password,
        pic: pic,
      });
      if (user) {
        // We send a response with a status code of 201
        // and a json object with the user's id, name, email, and token.
        // Every model must have an _id field,
        // if not created, MongoDB will create one for you.
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          pic: user.pic,
          token: generateToken(user._id),
        });
      } else {
        res.status(400);
        throw new Error("Failed to create user");
      }
    }
  }

  /**
   * @desc    Authenticate user and get token
   * @route   POST "/login"
   * @access  Public
   * @param   {Object} req - The request object
   * @param   {Object} res - The response object
   * @returns {Object} - Returns a json object with the user's id, name, email, and token
   * @throws  {Error} - Throws an error if the user's email or password is invalid
   * @throws  {Error} - Throws an error if the user's email or password is not provided
   */
  static async authUser(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!email || !password) {
      res.status(400).send("Please fill all fields");
      //throw new Error("Please fill all fields");
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).send("Invalid email or password");
      //throw new Error("Invalid email or password");
    }
  }
}

module.exports = userControllers;
