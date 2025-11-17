import { body, param, query } from "express-validator";

export const idValidater = [
  param("id").isInt().withMessage("Id must be a number"),
];

export const orgValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .custom((val: string) => {
      if (val.includes(" "))
        throw Error("Organization name cannot contain spaces");
      if (val.includes("|"))
        throw Error("Organization name cannot contain | character");
      if (val.includes("-"))
        throw Error("Organization name cannot contain - character");
      return true;
    })
    .customSanitizer((input: string) => {
      return input.replace(" ", "").toLowerCase();
    }),

  body("pocName")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("pocEmail")
    .notEmpty()
    .withMessage("pocEmail is required")
    .isEmail()
    .withMessage("Poc Email must be valid"),

  body("pocPhone")
    .optional()
    .isMobilePhone("en-IN")
    .withMessage("Phone must be valid"),
];

export const deleteOrgValidator = [
  query("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("Name must be valid"),
];

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isString()
    .withMessage("Email must be a string"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string"),
];

export const onBoardValidator = [
  body("token")
    .notEmpty()
    .withMessage("Token is required")
    .isJWT()
    .withMessage("Token must be a valid JWT"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 7, max: 13 })
    .withMessage("Password must be minimum 7 and maxmium 13 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("ConfirmPassword is required")
    .isString()
    .withMessage("ConfirmPassword must be a string")
    .custom((val: string, { req }) => {
      const { password } = req.body as { password: string };
      return val === password;
    })
    .withMessage("Password and Confirm Password must be same"),
];

export const changePasswordValidator = [
  body("token")
    .notEmpty()
    .withMessage("Token is required")
    .isJWT()
    .withMessage("Token must be a valid JWT"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 7, max: 13 })
    .withMessage("Password must be minimum 7 and maxmium 13 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("ConfirmPassword is required")
    .isString()
    .withMessage("ConfirmPassword must be a string")
    .custom((val: string, { req }) => {
      const { password } = req.body as { password: string };
      return val === password;
    })
    .withMessage("Password and Confirm Password must be same"),
];

export const changePasswordProfileValidator = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old Password is required")
    .isString()
    .withMessage("Old Password must be a string"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 7, max: 13 })
    .withMessage("Password must be minimum 7 and maxmium 13 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("ConfirmPassword is required")
    .isString()
    .withMessage("ConfirmPassword must be a string")
    .custom((val: string, { req }) => {
      const { password } = req.body as { password: string };
      return val === password;
    })
    .withMessage("Password and Confirm Password must be same"),
];

export const tokenValidator = [
  query("token")
    .notEmpty()
    .withMessage("Token is required")
    .isJWT()
    .withMessage("Token must be a valid JWT"),
];


export const singleAccountValidator = [
  body("accountId")
    .notEmpty()
    .withMessage("Account Id is required")
    .isString()
    .withMessage("Account Id must be a string")
    .isLength({ min: 10 })
    .withMessage("Account id must be at least 20 chars"),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isString()
    .withMessage("Username must be a string"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string"),
];

const allowedPlatforms = ["instagram", "linkedin", "facebook", "tik-tok"];

export const postValidator = [
  body("media_file_id")
    .notEmpty()
    .withMessage("File is required")
    .isNumeric()
    .withMessage("File Id must be a number"),

  body("scheduled_at").notEmpty().withMessage("Scheduled At is required"),
  // .isDate()
  // .withMessage("Scheduled At must be in valid format"),
  // .custom((val: Date) => {
  //   console.log(val, new Date());
  //   return val > new Date();
  // })
  // .withMessage("Schedule must be in future date"),

  body("account_ids")
    .notEmpty()
    .withMessage("Account ids is required")
    .isArray({ min: 1 })
    .withMessage("At least one account is required"),
];

export const userValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be valid"),

  body("phone")
    .optional()
    .isMobilePhone("en-IN")
    .withMessage("Phone must be valid"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isString()
    .withMessage("Role must be a string")
    .isIn(["org-admin", "org-user"])
    .withMessage("Role must be in org-admin or org-user"),
];

export const registerValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be valid"),

  body("phone")
    .optional()
    .isMobilePhone("en-IN")
    .withMessage("Phone must be valid"),
];

export const uploadFileValidator = [
  body("account_id")
    .notEmpty()
    .withMessage("Account id is required")
    .isString()
    .withMessage("Account id must be a string"),
  param("platform")
    .notEmpty()
    .withMessage("Platform is required")
    .isIn(allowedPlatforms)
    .withMessage(`Platform must be in ${allowedPlatforms.join(",")}`),
];

export const userApproveValidator = [
  body("userId")
    .notEmpty()
    .withMessage("User id is required")
    .isNumeric()
    .withMessage("User id must be a number"),
];

export const resetPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be valid"),
];

export const insightsValidator = [
  query("account_id")
    .notEmpty()
    .withMessage("Account Id is required")
    .isString()
    .withMessage("Account Id must be valid"),
];
