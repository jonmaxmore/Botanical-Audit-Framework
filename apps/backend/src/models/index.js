/**
 * Models Index
 * Central export point for all database models
 */

const User = require('./User');
const Farmer = require('./Farmer');
const BaseModel = require('./BaseModel');

module.exports = {
  User,
  Farmer,
  BaseModel
};
