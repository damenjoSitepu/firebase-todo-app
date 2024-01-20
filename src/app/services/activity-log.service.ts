import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { activityLog } from '../types/activity-log.type';
import { IpInfoService } from './ip-info.service';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ipInfo } from '../types/ip-info.type';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  /** 
   * Initialize FireStore
    */  
  private _firestore: Firestore = inject(Firestore);

  /**
   * Initialize Services
   * @param {IpInfoService} _ipInfoService 
   */
  constructor(
    private _ipInfoService: IpInfoService,
  ) { }

  /**
   * Create Activity Logs
   * 
   * @param {activityLog.Request} req 
   * @returns {void}
   */
  public create(req: activityLog.Request): void {
    this._ipInfoService.getUserInfo()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => { console.error(error.message) });
        })
      )
      .subscribe(async (userInfo: ipInfo.GetUserInfo) => {
        await addDoc(collection(this._firestore, "activityLogs"), {
          action: req.action,
          coreModuleAffected: req.coreModuleAffected,
          happenedAt: Date.now(),
          status: req.status,
          userInfo,
        });
      });
  }
}
