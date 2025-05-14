const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Authentication API", () => {
  describe("POST /api/auth/signup", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password123",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.user).toHaveProperty("id");
      expect(res.body.data.user).toHaveProperty("name", "Test User");
      expect(res.body.data.user).toHaveProperty("email", "test@example.com");
      expect(res.body.data.user).toHaveProperty("role", "user");
      expect(res.body.data).toHaveProperty("token");
    });

    it("should not register a user with duplicate email", async () => {
      await User.create({
        name: "Existing User",
        email: "test@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("error");
    });

    it("should not register a user with mismatched passwords", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password456",
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login a user with correct credentials", async () => {
      // Create a user first
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user).toHaveProperty("id");
      expect(res.body.data.user).toHaveProperty("name", "Test User");
      expect(res.body.data.user).toHaveProperty("email", "test@example.com");
    });

    it("should not login a user with incorrect credentials", async () => {
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe("error");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should get current user profile with valid token", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      // Get token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.user).toHaveProperty("id");
      expect(res.body.data.user).toHaveProperty("name", "Test User");
      expect(res.body.data.user).toHaveProperty("email", "test@example.com");
    });

    it("should not get user profile without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.statusCode).toBe(401);
    });
  });
});
