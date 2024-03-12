const UserService = require("../UserService");
const mockingoose = require("mockingoose");
const User = require("../../models/User");

beforeAll(() => {});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("UserService test", () => {
  it("has a module", () => {
    expect(UserService).toBeDefined();
  });
  describe("checkAUserExist", () => {
    it("A user exist", async () => {
      const count = 1;
      mockingoose(User).toReturn(count, "estimatedDocumentCount");
      const actual = await UserService.checkAUserExist();
      await User.estimatedDocumentCount().then((docCount) => {
        let expected = false;
        if (docCount > 0) {
          expected = true;
        }
        expect(actual).toBe(expected);
      });
    });
    it("A user does not exist", async () => {
      const count = 0;
      mockingoose(User).toReturn(count, "estimatedDocumentCount");
      const actual = await UserService.checkAUserExist();
      await User.estimatedDocumentCount().then((docCount) => {
        let expected = false;
        if (docCount > 0) {
          expected = true;
        }
        expect(actual).toBe(expected);
      });
    });
  });

  describe("createUser", () => {
    it("Create User with valid PIN", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      const actual = await UserService.createUser("1234", "1234");
      expect(actual).toMatchObject({
        message: "User successfully created",
        success: true,
      });
    });
    it("Create User when another user exists", async () => {
      jest.spyOn(UserService, "checkAUserExist").mockImplementation(() => true);
      const actual = await UserService.createUser("1234", "1234");
      expect(actual).toMatchObject({
        message: "A user already exists",
        success: false,
      });
    });
    it("Create User with invalid PIN", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      let actual;
      const wrongPINS = [
        { choosePIN: 1234, confirmPIN: 1234 },
        { choosePIN: "HAHA", confirmPIN: "HAHA" },
        { choosePIN: "ShouldNotPass", confirmPIN: "ShouldNotPass" },
      ];
      let error = null;
      for (const wrong of wrongPINS) {
        try {
          actual = await UserService.createUser(
            wrong.choosePIN,
            wrong.confirmPIN
          );
        } catch (e) {
          error = e;
        }
        expect(actual).toMatchObject({
          message: "ValidationError: PIN: PIN must be 4 digit",
          success: false,
        });
      }
    });

    it("Create User with non-matching PIN", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      const actual = await UserService.createUser("1234", "4321");

      expect(actual).toMatchObject({
        message: "PINs do not match. Please try again",
        success: false,
      });
    });

    it("Create User with weak PIN", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      const actual = await UserService.createUser("4444", "4444");

      expect(actual).toMatchObject({
        message: "PIN cannot be the same digit. Please choose a stronger PIN",
        success: false,
      });
    });
  });

  describe("login", () => {
    it("No user exist", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      const _doc = [{}];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.login("1234");
      expect(actual).toMatchObject({
        message: "A user does not exist.",
        success: false,
      });
    });
    it("Successful login", async () => {
      jest.spyOn(UserService, "checkAUserExist").mockImplementation(() => true);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.login("1234");
      expect(actual).toMatchObject({
        message: "Successfully logged in.",
        success: true,
        token: expect.any(String),
      });
    });
    it("Wrong PIN ", async () => {
      jest.spyOn(UserService, "checkAUserExist").mockImplementation(() => true);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.login("9876");
      expect(actual).toMatchObject({
        message:
          "User does not exist or PIN is incorrect. You have 4 attempts left.",
        success: false,
      });
    });
    it("No login attempts left ", async () => {
      jest.spyOn(UserService, "checkAUserExist").mockImplementation(() => true);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 5,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.login("9876");
      expect(actual).toMatchObject({
        message:
          "User does not exist or PIN is incorrect. You have no attempts left. Barred from logging in.",
        success: false,
      });
    });
    it("Exceed login attempts", async () => {
      jest.spyOn(UserService, "checkAUserExist").mockImplementation(() => true);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 6,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          lockUntil: Date.parse(new Date(new Date().getTime() + 5 * 60000)),
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.login("9876");
      expect(actual).toMatchObject({
        message:
          "You have exceed the max login attempts(5). Barred from logging in for the next 5 minutes.",
        success: false,
      });
    });
  });

  describe("resetPIN", () => {
    it("No user exist", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      const _doc = [{}];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.resetPIN("1234", "2345", "2345");
      expect(actual).toMatchObject({
        message: "A user does not exist.",
        success: false,
      });
    });

    it("Succesfully Reset", async () => {
      jest.spyOn(UserService, "checkAUserExist").mockImplementation(() => true);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.resetPIN("1234", "2345", "2345");
      expect(actual).toMatchObject({
        message: "PIN successfully reset",
        success: true,
      });
    });

    it("One of the PINs is missing", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.resetPIN("1234", "2345");
      expect(actual).toMatchObject({
        message: "A required parameter is missing. Please try again",
        success: false,
      });
    });

    it("ConfirmPIN do not match choosePIN", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.resetPIN("1234", "2345", "5678");
      expect(actual).toMatchObject({
        message: "PINs do not match. Please try again",
        success: false,
      });
    });

    it("New PIN must have 4 digit", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.resetPIN("1234", "56", "56");
      expect(actual).toMatchObject({
        message: "PIN must be 4 digit",
        success: false,
      });
    });

    it("ConfirmPIN same as old PIN", async () => {
      jest
        .spyOn(UserService, "checkAUserExist")
        .mockImplementation(() => false);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.resetPIN("1234", "1234", "1234");
      expect(actual).toMatchObject({
        message:
          "New PIN is the same as the old PIN. Please choose a different PIN",
        success: false,
      });
    });

    it("Incorrect PIN", async () => {
      jest.spyOn(UserService, "checkAUserExist").mockImplementation(() => true);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.resetPIN("2345", "5678", "5678");
      expect(actual).toMatchObject({
        message: "User does not exist or incorrect PIN",
        success: false,
      });
    });
    it("PIN is not a number", async () => {
      jest.spyOn(UserService, "checkAUserExist").mockImplementation(() => true);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.resetPIN("1234", "ABCD", "ABCD");
      expect(actual).toMatchObject({
        message: "PIN must be 4 digit",
        success: false,
      });
    });
    it("Weak PIN", async () => {
      jest.spyOn(UserService, "checkAUserExist").mockImplementation(() => true);
      const _doc = [
        {
          _id: { $oid: "619db0bf4b50b6136ab2b770" },
          hashed_PIN:
            "$2b$10$IrIK300GhpQe2Iajc3rsvesbwC2AkTVT4qHOiHEXR/In30MEba9Ri",
          loginAttempts: 0,
          createdAt: { $date: "2021-11-24T03:25:51.863Z" },
          updatedAt: { $date: "2021-11-24T03:25:51.863Z" },
          __v: 0,
        },
      ];
      mockingoose(User).toReturn(_doc);
      const actual = await UserService.resetPIN("1234", "1111", "1111");
      expect(actual).toMatchObject({
        message: "PIN cannot be the same digit. Please choose a stronger PIN",
        success: false,
      });
    });
  });
});
