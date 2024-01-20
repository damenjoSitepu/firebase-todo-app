import { Injectable } from '@angular/core';
import {Cloudinary} from '@cloudinary/url-gen'
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cloudinary } from '../types/cloudinary.type';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  /**
   * Cloudinary Instances
   */
  private _cldInstance: Cloudinary = new Cloudinary({
    cloud: {
      cloudName: environment.cloudinary.cloudName,
      apiKey: environment.cloudinary.apiKey,
      apiSecret: environment.cloudinary.apiSecret,
    },
  });

  /**
   * Initialize Services
   * @param {HttpClient} _http 
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Get Cloudinary Instance
   * @returns {Cloudinary}
   */
  public getInstance(): Cloudinary {
    try {
      return this._cldInstance;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Upload Image To Cloudinary Functionality
   * @param {File} file
   * @returns {Observable<any>}
   */
  public uploadImage(file: File): Observable<cloudinary.UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", environment.cloudinary.uploadPresetName);
    return this._http.post<cloudinary.UploadResult>(`https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`, formData);
  }
}
