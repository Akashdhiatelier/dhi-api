class CustomError extends Error {
  constructor(statusCode, message) {
    super();
    this.status = statusCode;
    this.success = false;
    this.data = null;
    this.errorMessage = message;
  }
}

module.exports = CustomError;
