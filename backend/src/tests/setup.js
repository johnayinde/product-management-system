require("dotenv").config({ path: ".env.test" });

jest.setTimeout(30000);

jest.mock("axios", () => ({
  create: jest.fn(() => ({
    post: jest.fn().mockResolvedValue({
      data: {
        status: true,
        data: {
          authorization_url: "https://paystack.com/pay/test",
          reference: "test_reference",
        },
      },
    }),
    get: jest.fn().mockResolvedValue({
      data: {
        status: true,
        data: {
          status: "success",
          id: "test_transaction_id",
        },
      },
    }),
  })),
}));
