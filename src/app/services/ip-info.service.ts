import { Injectable } from '@angular/core';
import { ipInfo } from '../types/ip-info.type';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpInfoService {
  /**
   * Initialize Services
   * @param _http 
   */
  public constructor(
    private _http: HttpClient,
  ) {}

  /**
   * Get User Information Via Ip Info Third Party
   * @returns {Observable<ipInfo.GetUserInfo>}
   */
  public getUserInfo(): Observable<ipInfo.GetUserInfo> {
    return this._http.get<ipInfo.GetUserInfo>(`${environment.ipInfo.url}${environment.ipInfo.token}`);
  }
}
