/**
 * Controllers Index
 * Central export point for all controllers
 */

const AuthController = require('./AuthController');
const UserController = require('./UserController');

module.exports = {
  AuthController,
  UserController,
};
