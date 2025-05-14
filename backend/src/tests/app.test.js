const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Application", () => {
  it("should respond to health check", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("Server is running");
  });

  it("should handle 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown-route");

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toContain("Cannot find");
  });

  it("should handle validation errors", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "invalid-email@",
    });

    expect(res.statusCode).toBe(400);
  });

  it("should handle server errors in development mode", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    app.get("/test-error", () => {
      throw new Error("Test error");
    });

    const res = await request(app).get("/test-error");

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("error");

    process.env.NODE_ENV = originalEnv;
  });
});
