import { GeelarkAPI } from "@/common/platform-api/geelark.serivce";
import { Request, Response } from "express";
import { Mobile } from "./mobile.model";

const geelarkApi = new GeelarkAPI();

export const allMobiles = async (_: Request, res: Response) => {
  const mobiles = await Mobile.find({}, { __v: 0 })
  res.json(mobiles);
};

export const mobilesDropdown = async (_: Request, res: Response) => {
  const dbMobiles = await Mobile.find({}, { __v: 0 })

  const mobiles = dbMobiles.flatMap(m => ({
    id: m.mobileId,
    name: `${m.serialName} - ${m.brand}`
  }));

  res.json(mobiles);
};

export const refreshMobiles = async (_: Request, res: Response) => {
  const mobiles = await geelarkApi.getPhones();

  await Mobile.deleteMany({}); // deleting the mobiles
  await Mobile.create(mobiles); // adding those again

  res.json({
    msg: "Mobile refreshed successfully"
  });
};