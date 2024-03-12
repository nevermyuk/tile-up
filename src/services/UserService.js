const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { accessTokenSecret } = require("../config/config.js");

const { saltRounds } = require("../config/config.js");

class UserService {
  constructor() {}

  async checkAUserExist() {
    const result = await User.estimatedDocumentCount()
      .exec()
      .then(function (count) {
        if (count > 0) {
          return true;
        } else {
          return false;
        }
      })
      .catch(
        /* istanbul ignore next */
        function (err) {
          return false;
        }
      );
    return result;
  }

  async login(PIN) {
    try {
      const userExists = await this.checkAUserExist();
      if (userExists) {
        const Users = await User.find({}).exec();
        const foundUser = Users[0];
        const hashedPIN = foundUser.hashed_PIN;

        if (foundUser.isLocked) {
          // just increment login attempts if account is already locked
          const { lockUntil, updates } = foundUser.incLoginAttempts();
          User.updateOne({ _id: foundUser._id }, updates).exec();
          return {
            message: `You have exceed the max login attempts(5). Barred from logging in for the next 5 minutes.`,
            success: false,
            lockUntil: lockUntil,
          };
        }
        const cmp = await User.authenticate(PIN, hashedPIN);
        if (cmp) {
          const token = jwt.sign({}, accessTokenSecret, { expiresIn: "1d" });
          User.updateOne(
            { _id: foundUser._id },
            {
              $set: { loginAttempts: 0 },
              $unset: { lockUntil: 1 },
            }
          ).exec();
          return {
            message: "Successfully logged in.",
            success: true,
            token: token,
          };
        } else {
          const { updates, loginAttempts } = foundUser.incLoginAttempts();
          User.updateOne({ _id: foundUser._id }, updates).exec();
          if (loginAttempts - 1 <= 0) {
            return {
              message: `User does not exist or PIN is incorrect. You have no attempts left. Barred from logging in.`,
              success: false,
            };
          } else {
            return {
              message: `User does not exist or PIN is incorrect. You have ${
                loginAttempts - 1
              } attempts left.`,
              success: false,
            };
          }
        }
      } else {
        return {
          message: "A user does not exist.",
          success: false,
        };
      }
    } catch (e) {
      /* istanbul ignore next */
      return {
        message: "An error occured in UserService",
        success: false,
      };
    }
  }

  async createUser(confirmPIN, choosePIN) {
    try {
      if (confirmPIN != choosePIN) {
        return {
          message: "PINs do not match. Please try again",
          success: false,
        };
      }
      if (this.checkSameDigits(confirmPIN)) {
        return {
          message: "PIN cannot be the same digit. Please choose a stronger PIN",
          success: false,
        };
      }
      const userExists = await this.checkAUserExist();
      if (userExists) {
        return { message: "A user already exists", success: false };
      }
      let result = await new User({
        PIN: confirmPIN,
      }).save();
      return {
        message: "User successfully created",
        success: true,
      };
    } catch (e) {
      return { message: `${e}`, success: false };
    }
  }

  async resetPIN(PIN, choosePIN, confirmPIN) {
    try {
      if (!PIN || !choosePIN || !confirmPIN) {
        return {
          message: "A required parameter is missing. Please try again",
          success: false,
        };
      }
      if (confirmPIN != choosePIN) {
        return {
          message: "PINs do not match. Please try again",
          success: false,
        };
      }
      if (this.checkSameDigits(confirmPIN)) {
        return {
          message: "PIN cannot be the same digit. Please choose a stronger PIN",
          success: false,
        };
      }

      if (PIN === confirmPIN) {
        return {
          message:
            "New PIN is the same as the old PIN. Please choose a different PIN",
          success: false,
        };
      }
      if (confirmPIN && confirmPIN.length !== 4) {
        return {
          message: "PIN must be 4 digit",
          success: false,
        };
      }
      if (confirmPIN && isNaN(confirmPIN)) {
        return {
          message: "PIN must be 4 digit",
          success: false,
        };
      }

      const userExists = await this.checkAUserExist();
      if (userExists) {
        const foundUser = await User.find({}).exec();
        const user = foundUser[0];
        const hashedPIN = user.hashed_PIN;
        const cmp = await User.authenticate(PIN, hashedPIN);
        if (cmp) {
          const newHashedPin = await bcrypt.hash(confirmPIN, saltRounds);
          await User.findByIdAndUpdate(user._id, {
            hashed_PIN: newHashedPin,
          });
          return {
            message: "PIN successfully reset",
            success: true,
          };
        } else {
          return {
            message: "User does not exist or incorrect PIN",
            success: false,
          };
        }
      } else {
        return {
          message: "A user does not exist.",
          success: false,
        };
      }
    } catch (e) {
      /* istanbul ignore next */
      return { message: `${e}`, success: false };
    }
  }

  checkSameDigits(PIN) {
    let last_digit = PIN % 10;
    while (PIN != 0) {
      let current_digit = PIN % 10;
      PIN = parseInt(PIN / 10);
      if (current_digit != last_digit) {
        return false;
      }
    }
    return true;
  }
}

module.exports = new UserService();
