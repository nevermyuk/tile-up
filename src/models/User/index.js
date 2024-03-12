const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { saltRounds } = require("../../config/config.js");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 1 * 60 * 5 * 1000;
/*
References
https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-2 
*/

const UserSchema = new Schema(
  {
    hashed_PIN: {
      type: String,
      required: true,
    },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number },
  },
  { timestamps: true }
);

UserSchema.statics.generateHash = function (PIN) {
  try {
    const hashedPIN = bcrypt.hashSync(PIN, saltRounds);
    return hashedPIN;
  } catch (err) {
    return err;
  }
};

UserSchema.virtual("PIN")
  .set(async function (PIN) {
    this._PIN = PIN;
    this.hashed_PIN = this.model("User").generateHash(PIN);
  })
  .get(function () {
    return this._PIN;
  });

UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.path("hashed_PIN").validate(function () {
  if (this._PIN && this._PIN.length !== 4) {
    this.invalidate("PIN", "PIN must be 4 digit");
  }
  if (this._PIN && isNaN(this._PIN)) {
    this.invalidate("PIN", "PIN must be 4 digit");
  }
  if (!this._PIN) {
    this.invalidate("PIN", "PIN is required");
  }
}, null);

/**
 *
 * @param {String} given_PIN
 * @param {String} hashed_PIN
 * @returns A promise
 */
UserSchema.statics.authenticate = function (given_PIN, hashed_PIN) {
  return bcrypt.compare(given_PIN, hashed_PIN);
};

UserSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return {
      lockUntil: this.lockUntil,
      updates: {
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 },
      },
    };
  }
  let updates = { $inc: { loginAttempts: 1 }, $set: {} };
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return {
    lockUntil: this.lockUntil,
    updates,
    loginAttempts: MAX_LOGIN_ATTEMPTS - this.loginAttempts,
  };
};

const User = model("User", UserSchema);

module.exports = User;
