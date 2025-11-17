import { Request, Response } from "express";
import { Account } from "./account.model";
import { IAccountDto, ISocialPlatform } from "@shared/types";
import { BadRequest, NotFound } from "@/common/custom-error";
import { GeelarkAPI } from "@/common/platform-api/geelark.serivce";
import logger from "@/common/logger";
import xlsx from "xlsx";
import fileUpload from "express-fileupload";

const geelarkApi = new GeelarkAPI();

export const newAccountsBulk = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new BadRequest(`File is required for bulk upload`);
  }

  const file = req.files.media as fileUpload.UploadedFile;

  const workBook = xlsx.read(file.data);
  const sheetName = workBook.SheetNames[0];
  const workSheet = workBook.Sheets[sheetName];

  const accountsJson: IAccountDto[] = xlsx.utils.sheet_to_json(workSheet);

  await Account.create(accountsJson);

  const requestsToLogin = [];

  logger.info("we got a array of accounts to process");

  for (const acc of accountsJson) {
    requestsToLogin.push(geelarkApi.autoLogin(acc));
  }

  await Promise.all(requestsToLogin); // doing login calls in parallel

  res.json({
    msg: "Multiple accounts created",
  });
};

export const newAccounts = async (req: Request, res: Response) => {
  await Account.create(req.body);

  const requestsToLogin = [];
  let msg = "Account created";

  if (Array.isArray(req.body)) {
    logger.info("we got a array of accounts to process");

    for (const acc of req.body) {
      requestsToLogin.push(geelarkApi.autoLogin(acc));
    }
    msg = `${req.body.length} accounts created`;
  } else if (typeof req.body === "object") {
    logger.info("we got a single account to process");
    const acc = req.body;
    requestsToLogin.push(geelarkApi.autoLogin(acc));
    msg = "Account created";
  }

  await Promise.all(requestsToLogin); // doing login calls in parallel

  res.json({ msg });
};


export const allAccounts = async (req: Request, res: Response) => {
  const { search, platform } = req.query as { search: string, platform: ISocialPlatform };

  const or = [];

  if (search) {
    or.push({ username: { $regex: search, $options: "i" } })
  }

  if (platform) {
    or.push({ platform })
  }

  const pipeline = [];

  if (or.length > 0) {
    pipeline.push({ $match: { $or: or } });
  }

  pipeline.push({
    $lookup: {
      from: "mobiles",
      localField: "mobileId",
      foreignField: "mobileId",
      as: "mobile"
    },
  }, {
    $unwind: { path: "$mobile", preserveNullAndEmptyArrays: true },
  }, {
    $project: {
      "__v": 0,
      "mobile._id": 0,
      "mobile.__v": 0,
      "mobile.mobileId": 0,
      "mobile.equipmentInfo": 0,
      "mobile.model": 0,
      "mobile.osVersion": 0,
    }
  });

  const accounts = await Account.aggregate(pipeline);

  res.json(accounts);
};


export const edit = async (req: Request, res: Response) => {
  const { id } = req.params;

  await Account.findByIdAndUpdate(id, req.body);

  res.json({ msg: `Account updated successfully` });
};

export const accDropdown = async (req: Request, res: Response) => {
  const filters: Record<string, any> = {};
  const { platforms } = req.query as { platforms: string };

  const platformsArr = platforms ? platforms.split(",") : [];

  if (platformsArr && platformsArr.length > 0) {
    filters.platform = { $in: platformsArr };
  }

  const dbAccounts = await Account.find(filters, { __v: 0 });

  const accounts = dbAccounts.flatMap(acc => ({
    id: acc._id,
    name: `${acc.username} (${acc.platform})`
  }));

  res.json(accounts);
};


export const loginAccount = async (req: Request, res: Response) => {
  const { id } = req.params;

  const account = await Account.findById(id) as IAccountDto;

  if (!account) {
    throw new NotFound(`Account with id ${id} not found`);
  }

  const { mobileId } = account;

  if (!mobileId) {
    throw new NotFound(`Mobile ID not found for account with id ${id}`);
  }

  const loginRes = await geelarkApi.autoLogin(account);

  res.json({ msg: `Account logged in successfully`, data: loginRes });
};


export const deleteAcc = async (req: Request, res: Response) => {
  const { id } = req.params;
  const account = await Account.findById(id);

  if (!account) {
    throw new NotFound(`Account with id ${id} not found`);
  }

  await account.deleteOne();

  res.json({ msg: "Account deleted successfully" });
};

