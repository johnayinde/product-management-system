const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let adminToken;
let userToken;
let adminUser;
let regularUser;

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
});

// Clear products between tests
beforeEach(async () => {
  await Product.deleteMany({});
});

// Close connection and stop server after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Products API", () => {
  describe("GET /api/products", () => {
    it("should get all products", async () => {
      await Product.create([
        {
          name: "Test Product 1",
          description: "Test description for product 1",
          price: 99.99,
          quantity: 10,
          category: "Electronics",
          createdBy: adminUser._id,
        },
        {
          name: "Test Product 2",
          description: "Test description for product 2",
          price: 49.99,
          quantity: 20,
          category: "Books",
          createdBy: adminUser._id,
        },
      ]);

      const res = await request(app).get("/api/products");

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.products.length).toBe(2);
      expect(res.body.data).toHaveProperty("totalPages");
      expect(res.body.data).toHaveProperty("currentPage");
    });

    it("should filter products by category", async () => {
      await Product.create([
        {
          name: "Test Product 1",
          description: "Test description for product 1",
          price: 99.99,
          quantity: 10,
          category: "Electronics",
          createdBy: adminUser._id,
        },
        {
          name: "Test Product 2",
          description: "Test description for product 2",
          price: 49.99,
          quantity: 20,
          category: "Books",
          createdBy: adminUser._id,
        },
      ]);

      const res = await request(app).get("/api/products?category=Electronics");

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0].category).toBe("Electronics");
    });

    it("should search products by name", async () => {
      await Product.create([
        {
          name: "Laptop",
          description: "Test description for product 1",
          price: 99.99,
          quantity: 10,
          category: "Electronics",
          createdBy: adminUser._id,
        },
        {
          name: "Smartphone",
          description: "Test description for product 2",
          price: 49.99,
          quantity: 20,
          category: "Electronics",
          createdBy: adminUser._id,
        },
      ]);

      const res = await request(app).get("/api/products?search=laptop");

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0].name).toBe("Laptop");
    });
  });

  describe("GET /api/products/:id", () => {
    it("should get a product by id", async () => {
      const product = await Product.create({
        name: "Test Product",
        description: "Test description for product",
        price: 99.99,
        quantity: 10,
        category: "Electronics",
        createdBy: adminUser._id,
      });

      const res = await request(app).get(`/api/products/${product._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.product).toHaveProperty("name", "Test Product");
      expect(res.body.data.product).toHaveProperty("price", 99.99);
    });

    it("should return 404 for non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${nonExistentId}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /api/products", () => {
    it("should create a new product with admin token", async () => {
      const newProduct = {
        name: "New Product",
        description: "Description for the new product that is being tested",
        price: 149.99,
        quantity: 15,
        category: "Electronics",
      };

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.product).toHaveProperty("name", "New Product");
      expect(res.body.data.product).toHaveProperty("price", 149.99);
      expect(res.body.data.product).toHaveProperty("createdBy");
    });

    it("should not allow regular users to create products", async () => {
      const newProduct = {
        name: "New Product",
        description: "Description for the new product that is being tested",
        price: 149.99,
        quantity: 15,
        category: "Electronics",
      };

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newProduct);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("PATCH /api/products/:id", () => {
    it("should update a product with admin token", async () => {
      const product = await Product.create({
        name: "Test Product",
        description: "Test description for product",
        price: 99.99,
        quantity: 10,
        category: "Electronics",
        createdBy: adminUser._id,
      });

      const updateData = {
        name: "Updated Product",
        price: 129.99,
      };

      const res = await request(app)
        .patch(`/api/products/${product._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.product).toHaveProperty("name", "Updated Product");
      expect(res.body.data.product).toHaveProperty("price", 129.99);
      expect(res.body.data.product).toHaveProperty(
        "description",
        "Test description for product"
      );
    });

    it("should not allow regular users to update products", async () => {
      const product = await Product.create({
        name: "Test Product",
        description: "Test description for product",
        price: 99.99,
        quantity: 10,
        category: "Electronics",
        createdBy: adminUser._id,
      });

      const updateData = {
        name: "Updated Product",
        price: 129.99,
      };

      const res = await request(app)
        .patch(`/api/products/${product._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete a product with admin token", async () => {
      const product = await Product.create({
        name: "Test Product",
        description: "Test description for product",
        price: 99.99,
        quantity: 10,
        category: "Electronics",
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      const checkProduct = await Product.findById(product._id);
      expect(checkProduct).toBeNull();
    });

    it("should not allow regular users to delete products", async () => {
      const product = await Product.create({
        name: "Test Product",
        description: "Test description for product",
        price: 99.99,
        quantity: 10,
        category: "Electronics",
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("POST /api/products/check-stock", () => {
    it("should check if a product is in stock", async () => {
      const product = await Product.create({
        name: "Test Product",
        description: "Test description for product",
        price: 99.99,
        quantity: 10,
        category: "Electronics",
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .post("/api/products/check-stock")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: product._id,
          quantity: 5,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("inStock", true);
      expect(res.body.data).toHaveProperty("availableQuantity", 10);
    });

    it("should return false if product is not in stock", async () => {
      const product = await Product.create({
        name: "Test Product",
        description: "Test description for product",
        price: 99.99,
        quantity: 10,
        category: "Electronics",
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .post("/api/products/check-stock")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: product._id,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("inStock", false);
      expect(res.body.data).toHaveProperty("availableQuantity", 10);
    });
  });
});
