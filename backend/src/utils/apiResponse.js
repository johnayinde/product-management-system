class ApiResponse {
  /**
   * Create a success response.
   * @param {string} message - Success message
   * @param {*} data - Response data
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Response object
   */
  static success(message, data = null, statusCode = 200) {
    return {
      status: "success",
      message,
      data,
      statusCode,
    };
  }

  /**
   * Create an error response.
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} errors - Additional error details
   * @returns {Object} Response object
   */
  static error(message, statusCode = 500, errors = null) {
    return {
      status: "error",
      message,
      errors,
      statusCode,
    };
  }

  /**
   * Create a validation error response.
   * @param {string} message - Error message
   * @param {Object} errors - Validation errors
   * @returns {Object} Response object
   */
  static validationError(message = "Validation failed", errors) {
    return {
      status: "fail",
      message,
      errors,
      statusCode: 400,
    };
  }
}

module.exports = ApiResponse;
