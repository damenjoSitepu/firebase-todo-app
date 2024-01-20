import { ipInfo } from "./ip-info.type";

export namespace activityLog {
  export interface Data {
    wid: string;
    action: string;
    coreModuleAffected: string;
    happenedAt: number;
    status: boolean;
    userInfo: ipInfo.GetUserInfo
  };
  
  export interface Request {
    action: string;
    coreModuleAffected: string;
    status: boolean;
  };
};