export namespace ipInfo {
  export interface GetUserInfo {
    ip: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    timezone: string;
  };
};