const { testMongoUri, TESTPORT } = require("../config/config");
const User = require("../models/User");

const request = require("supertest");
const ExpressServer = require("../express-server");
const mongoose = require("mongoose");

beforeAll(() => {
  server = new ExpressServer(`${testMongoUri}test-app`, TESTPORT);
  app = server.app;
});

afterAll(async () => {
  mongoose.connection.close();
  server.close();
});
describe("App test", () => {
  it("has a module", () => {
    expect(app).toBeDefined();
  });
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe("GET /user/exist", () => {
    afterEach(async () => {
      await User.deleteMany({});
    });
    test("should respond with error when user do not exist", async () => {
      const response = await request(app).get("/user/exist");
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toMatchObject({
        message: "User does not exist.",
      });
      expect(response.statusCode).toBe(500);
    });
    test("should respond with user exist", async () => {
      await request(app).post("/user/create").send({
        confirmPIN: "1234",
        choosePIN: "1234",
      });
      const response = await request(app).get("/user/exist");
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toMatchObject({
        message: "A user exists",
      });
      expect(response.statusCode).toBe(200);
    });
  });
  describe("POST /user/create", () => {
    afterEach(async () => {
      await User.deleteMany({});
    });
    test("should respond with an error occured with invalid PIN - NaN", async () => {
      const response = await request(app).post("/user/create").send({
        confirmPIN: "HAHA",
        choosePIN: "HAHA",
      });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toMatchObject({
        message: "ValidationError: PIN: PIN must be 4 digit",
      });
      expect(response.statusCode).toBe(500);
    });

    test("should respond with an error occured with invalid PIN - empty", async () => {
      const response = await request(app).post("/user/create").send({});
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toMatchObject({
        message: "ValidationError: PIN: PIN is required",
      });
      expect(response.statusCode).toBe(500);
    });
    test("should respond with user successfully created", async () => {
      const response = await request(app).post("/user/create").send({
        confirmPIN: "1234",
        choosePIN: "1234",
      });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toMatchObject({
        message: "User successfully created",
      });
      expect(response.statusCode).toBe(200);
    });
    test("should respond with user exist", async () => {
      await request(app).post("/user/create").send({
        confirmPIN: "1234",
        choosePIN: "1234",
      });
      const response = await request(app).post("/user/create").send({
        confirmPIN: "1234",
        choosePIN: "1234",
      });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toMatchObject({
        message: "A user already exists",
      });
      expect(response.statusCode).toBe(500);
    });
  });
  describe("POST /user/login", () => {
    beforeEach(async () => {
      await request(app).post("/user/create").send({
        confirmPIN: "1234",
        choosePIN: "1234",
      });
    });
    afterEach(async () => {
      await User.deleteMany({});
    });
    test("should respond with a successful login 200 status code", async () => {
      const response = await request(app).post("/user/login").send({
        PIN: "1234",
      });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Successfully logged in.",
          data: {
            token: expect.anything(),
          },
        })
      );
      expect(response.statusCode).toBe(200);
    });
    test("should respond with a banned from logging in with 403 status code", async () => {
      let response;
      for (let i = 0; i <= 6; i++) {
        response = await request(app).post("/user/login").send({
          PIN: "9876",
        });
      }

      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          message:
            "You have exceed the max login attempts(5). Barred from logging in for the next 5 minutes.",
          data: {
            lockUntil: expect.anything(),
          },
        })
      );
      expect(response.statusCode).toBe(403);
    });
  });

  describe("POST /user/reset", () => {
    beforeEach(async () => {
      await request(app).post("/user/create").send({
        confirmPIN: "1234",
        choosePIN: "1234",
      });
    });
    afterEach(async () => {
      await User.deleteMany({});
    });
    test("should require authorization", async () => {
      const response = await request(app).post("/user/reset").send({
        PIN: "1234",
        confirmPIN: "1234",
        choosePIN: "1234",
      });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "A token is required for authentication.",
          data: {
            tokenAuth: { access: false },
          },
        })
      );
      expect(response.statusCode).toBe(403);
    });

    test("should fail to verify token", async () => {
      const response = await request(app)
        .post("/user/reset")
        .set("x-access-token", "should-not-work")
        .send({
          PIN: "1234",
          confirmPIN: "1234",
          choosePIN: "1234",
        });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Failed to verify token",
          data: {
            tokenAuth: { access: false },
          },
        })
      );
      expect(response.statusCode).toBe(403);
    });
    test("should respond with successfully reset", async () => {
      const loginResponse = await request(app).post("/user/login").send({
        PIN: "1234",
      });
      const token = loginResponse.body.data.token;
      const response = await request(app)
        .post("/user/reset")
        .set("x-access-token", token)
        .send({
          PIN: "1234",
          confirmPIN: "2345",
          choosePIN: "2345",
        });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          data: { success: true },
          message: "PIN successfully reset",
        })
      );
      expect(response.statusCode).toBe(200);
    });
    test("should respond with choose a different PIN, new PIN is the same", async () => {
      const loginResponse = await request(app).post("/user/login").send({
        PIN: "1234",
      });
      const token = loginResponse.body.data.token;
      const response = await request(app)
        .post("/user/reset")
        .set("x-access-token", token)
        .send({
          PIN: "1234",
          confirmPIN: "1234",
          choosePIN: "1234",
        });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          message:
            "New PIN is the same as the old PIN. Please choose a different PIN",
        })
      );
      expect(response.statusCode).toBe(500);
    });
    test("should respond with choose a valid PIN", async () => {
      const loginResponse = await request(app).post("/user/login").send({
        PIN: "1234",
      });
      const token = loginResponse.body.data.token;
      const response = await request(app)
        .post("/user/reset")
        .set("x-access-token", token)
        .send({
          PIN: "1234",
          confirmPIN: "12NO",
          choosePIN: "12NO",
        });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "PIN must be 4 digit",
        })
      );
      expect(response.statusCode).toBe(500);
    });

    test("should respond with PIN must be 4 digit", async () => {
      const loginResponse = await request(app).post("/user/login").send({
        PIN: "1234",
      });
      const token = loginResponse.body.data.token;
      const response = await request(app)
        .post("/user/reset")
        .set("x-access-token", token)
        .send({
          PIN: "1234",
          confirmPIN: "56",
          choosePIN: "56",
        });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "PIN must be 4 digit",
        })
      );
      expect(response.statusCode).toBe(500);
    });
  });
});
