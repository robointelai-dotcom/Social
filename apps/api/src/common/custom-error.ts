export class BadRequest extends Error {
  code = 400;
  constructor(message: string) {
    super(message);
    this.name = "BadRequest";
  }
}

export class Unauthorized extends Error {
  code = 401;
  constructor(message: string) {
    super(message);
    this.name = "Unauthorized";
  }
}

export class RefreshTokenNotFound extends Error {
  code = 407;
  constructor(message: string) {
    super(message);
    this.name = "RefreshTokenNotFound";
  }
}

export class Forbidden extends Error {
  code = 403;
  constructor(message: string) {
    super(message);
    this.name = "Forbidden";
  }
}

export class NotFound extends Error {
  code = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFound";
  }
}

export class Conflict extends Error {
  code = 409;
  constructor(message: string) {
    super(message);
    this.name = "Conflict";
  }
}

export class InternalError extends Error {
  code = 500;
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}
