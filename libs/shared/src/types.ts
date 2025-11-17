export interface CacheOptions {
  maxAge?: number; // in seconds
  private?: boolean;
  noStore?: boolean;
}

export type ISocialPlatform = "instagram" | "facebook" | "tik-tok" | "youtube";

export interface IMenuItem {
  title: string;
  url: string;
  icon?: any;
  items?: IMenuItem[];
}

export interface IAccount {
  _id: string;
  deviceId: string;
  platform: ISocialPlatform;
  username: string;
  password: string;
}


export interface IAccountDto {
  mobileId: string;
  platform: ISocialPlatform;
  username: string;
  password: string;
}

export interface IAccountDao extends Omit<IAccount, 'deviceId'> {
  mobile: IPhone;
}

export interface IPhone {
  id: string;
  serialName: string;
  equipmentInfo: {
    deviceBrand: string;
    deviceModel: string;
    osVersion: string;
  }
}

export interface IPhoneDto {
  data: { items: IPhone[] }
}

export interface IPost {
  id: string;
  platform: ISocialPlatform;
  username: string;
  password: string;
}


export interface ISchedulePostRequest {
  platforms: ISocialPlatform[];
  scheduleAt: Date;
  accountIds: string;
  caption: string;
  mediaUrl: string;
}

export type IPostFilterDao = {
  search: string;
  platform: ISocialPlatform;
  status: string;
};

// USER RELATED
export interface IUser {

}

export interface AuthUser {
  role: IAuthRole
}

export type IAuthRole = "user";


declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}

export interface IMobile {
  id: string;
  name: string;
}

export interface AccountFormData extends Omit<IAccount, '_id'> {
  deviceId: string;
}