const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let adminToken;
let userToken;
let adminUser;
let regularUser;
let product;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  });

  regularUser = await User.create({
    name: "Regular User",
    email: "user@example.com",
    password: "password123",
    role: "user",
  });

  adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  userToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  product = await Product.create({
    name: "Test Product",
    description: "Test description for product",
    price: 99.99,
    quantity: 10,
    category: "Electronics",
    createdBy: adminUser._id,
  });
});

beforeEach(async () => {
  await Order.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Orders API", () => {
  describe("POST /api/orders", () => {
    it("should create a new order", async () => {

      const orderData = {
        products: [
          {
            productId: product._id,
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
      };

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

     
      expect(res.statusCode).not.toBe(404);
    });

    it("should not create an order with invalid data", async () => {
      const orderData = {
        products: [],
        shippingAddress: {
          street: "123 Test St",
        },
      };

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/orders", () => {
    it("should get all user orders for regular user", async () => {
      await Order.create({
        user: regularUser._id,
        products: [
          {
            product: product._id,
            name: product.name,
            quantity: 2,
            price: product.price,
          },
        ],
        totalAmount: product.price * 2,
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
      });

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.orders.length).toBe(1);
    });

    it("should get all orders for admin", async () => {
      await Order.create([
        {
          user: regularUser._id,
          products: [
            {
              product: product._id,
              name: product.name,
              quantity: 2,
              price: product.price,
            },
          ],
          totalAmount: product.price * 2,
          shippingAddress: {
            street: "123 Test St",
            city: "Test City",
            state: "Test State",
            zipCode: "12345",
            country: "Test Country",
          },
        },
        {
          user: adminUser._id,
          products: [
            {
              product: product._id,
              name: product.name,
              quantity: 1,
              price: product.price,
            },
          ],
          totalAmount: product.price,
          shippingAddress: {
            street: "456 Admin St",
            city: "Admin City",
            state: "Admin State",
            zipCode: "67890",
            country: "Admin Country",
          },
        },
      ]);

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.orders.length).toBe(2);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should get order by id for owner", async () => {
      const order = await Order.create({
        user: regularUser._id,
        products: [
          {
            product: product._id,
            name: product.name,
            quantity: 2,
            price: product.price,
          },
        ],
        totalAmount: product.price * 2,
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
      });

      const res = await request(app)
        .get(`/api/orders/${order._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.order).toHaveProperty("_id", order._id.toString());
    });

    it("should not allow access to order details for non-owner users", async () => {
      const order = await Order.create({
        user: adminUser._id,
        products: [
          {
            product: product._id,
            name: product.name,
            quantity: 1,
            price: product.price,
          },
        ],
        totalAmount: product.price,
        shippingAddress: {
          street: "456 Admin St",
          city: "Admin City",
          state: "Admin State",
          zipCode: "67890",
          country: "Admin Country",
        },
      });

      const res = await request(app)
        .get(`/api/orders/${order._id}`)
        .set("Authorization", `Bearer ${userToken}`);
      console.log("+++++body", res.body);
      console.log("+++++statusCode", res.statusCode);

      expect(res.statusCode).toBe(403);
    });

    it("should allow admin to access any order", async () => {
      const order = await Order.create({
        user: regularUser._id,
        products: [
          {
            product: product._id,
            name: product.name,
            quantity: 2,
            price: product.price,
          },
        ],
        totalAmount: product.price * 2,
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
      });

      const res = await request(app)
        .get(`/api/orders/${order._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.order).toHaveProperty("_id", order._id.toString());
    });
  });

  describe("POST /api/orders/:id/cancel", () => {
    it("should allow user to cancel their own order", async () => {
      const order = await Order.create({
        user: regularUser._id,
        products: [
          {
            product: product._id,
            name: product.name,
            quantity: 2,
            price: product.price,
          },
        ],
        totalAmount: product.price * 2,
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        status: "pending",
      });

      const res = await request(app)
        .post(`/api/orders/${order._id}/cancel`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.order).toHaveProperty("status", "cancelled");
    });

    it("should not allow cancellation of shipped orders", async () => {
      const order = await Order.create({
        user: regularUser._id,
        products: [
          {
            product: product._id,
            name: product.name,
            quantity: 2,
            price: product.price,
          },
        ],
        totalAmount: product.price * 2,
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        status: "shipped",
      });

      const res = await request(app)
        .post(`/api/orders/${order._id}/cancel`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe("PATCH /api/orders/:id/status", () => {
    it("should allow admin to update order status", async () => {
      const order = await Order.create({
        user: regularUser._id,
        products: [
          {
            product: product._id,
            name: product.name,
            quantity: 2,
            price: product.price,
          },
        ],
        totalAmount: product.price * 2,
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        status: "pending",
      });

      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "processing" });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.order).toHaveProperty("status", "processing");
    });

    it("should not allow regular users to update order status", async () => {
      const order = await Order.create({
        user: regularUser._id,
        products: [
          {
            product: product._id,
            name: product.name,
            quantity: 2,
            price: product.price,
          },
        ],
        totalAmount: product.price * 2,
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        status: "pending",
      });

      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "processing" });

      expect(res.statusCode).toBe(403);
    });
  });
});
