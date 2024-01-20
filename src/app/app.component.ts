import { Component, OnDestroy, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Subscription, catchError, finalize, throwError } from 'rxjs';
import { CloudinaryService } from './services/cloudinary.service';
import { IMAGE_MIME_TYPES } from './constants/image-types.const';
import { HttpErrorResponse } from '@angular/common/http';
import { task } from './types/task.type';
import { GeneratorService } from './services/generator.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy { 
  /**
   * Initialize FireStore
   */
  private _firestore: Firestore = inject(Firestore);

  /**
   * Utils
   */
  private _customCleartimeout: any = null;

  /**
   * Loader
   */
  protected isLoading: boolean = false;

  /**
   * Data
   */
  protected tasks: task.ModifiedData[] = [];

  /**
   * File Object
   */
  protected taskFileObject: task.FileObject = {
    image: null
  };

  /**
   * Request
   */
  protected taskReq: task.Request = {
    name: "",
    isCompleted: false,
    imageURL: "",
    imageCreatedAt: "",
    assetId: "",
    resourceType: "",
    type: "",
    publicId: "",
    signature: "",
  };

  /**
   * Subscription
   */
  private _tasksSub$!: Subscription;

  /**
   * Initialize Data
   * @param {AngularFirestore} _afs 
   * @param {CloudinaryService} _cloudinaryService
   * @param {GeneratorService} _generatorService
   */
  public constructor(
    private _afs: AngularFirestore,
    private _cloudinaryService: CloudinaryService,
    private _generatorService: GeneratorService
  ) { 
    this.getTasks();
  }

  public ngOnDestroy(): void {
    if (this._tasksSub$) this._tasksSub$.unsubscribe();
  }
  
  /**
   * Get Tasks
   * 
   * @returns {Promise<void>}
   */
  protected async getTasks(): Promise<void> {
    try {
      this._tasksSub$ = collectionData(collection(this._firestore, 'tasks'), { idField: 'wid' }).subscribe((tasks) => {
        this.tasks = (tasks as task.Data[]).map((task: task.Data) => {
          return {
            ...task,
            isUpdateHandlerClicked: false
          };
        });
      });
    } catch (e: any) {
      alert(e.message);
    }
  }

  /**
   * Delete Task
   * 
   * @param {any} e 
   * @param {?string} wid 
   * @returns {Promise<void>}
   */
  protected async deleteTask(e: any, wid?: string): Promise<void> {
    if (!wid) return;
    this.isLoading = true;
    try {
      await deleteDoc(doc(this._firestore, `tasks/${wid}`));
      // this._afs.collection("tasks").doc(wid).valueChanges().subscribe(async (task) => {
        // const castingTask = task as task.Data;
        // const timestamp = Math.floor(new Date().getTime() / 1000);
        // const signature = await this._generatorService.generateSHA1Signature(`eager=w_400,h_300,c_pad|w_260,h_200,c_crop&public_id=${castingTask.publicId}&timestamp=${timestamp}${environment.cloudinary.apiSecret}`);

        // this._cloudinaryService.deleteAsset({
        //   resourceType: castingTask.resourceType,
        //   publicId: castingTask.publicId,
        //   signature: signature,
        //   timestamp: timestamp,
        // }).subscribe((res) => {});
      // });
    } catch (e: any) {
      alert(e.message);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Edit Task
   * 
   * @param {any} e 
   * @param {?string} wid 
   * @returns {Promise<void>}
   */
  protected async editTask(e: any, wid?: string): Promise<void> {
    clearTimeout(this._customCleartimeout);
    this._customCleartimeout = setTimeout(async () => {
      if (!wid || this.tasks.length === 0) return;
      try { 
        const task: task.Data | undefined = this.tasks.find((task: task.Data) => task.wid === wid);
        if (!task) return;
  
        await updateDoc(doc(this._firestore, `tasks/${wid}`), {
          ...task
        });
      } catch (e: any) {
        alert(e.message);
      }
    }, 250);
  }

  /**
   * Update Task
   * 
   * @param {any} e 
   * @param {?string} wid 
   * @returns {Promise<void>}
   */
  protected updateTask(e: any, wid?: string): void {
    if (!wid || this.tasks.length === 0) return;
    try {
      this.tasks = [...this.tasks].map((task: task.ModifiedData) => {
        if (task.wid === wid) {
          return {
            ...task, 
            isUpdateHandlerClicked: !task.isUpdateHandlerClicked
          }
        } else {
          return {
            ...task,
            isUpdateHandlerClicked: false
          };
        }
      });
    } catch (e: any) {
      alert(e.message);
    }
  }

  /**
   * Add Task
   * 
   * @param {any} e 
   * @returns {Promise<void>} 
   */
  protected async addTask(e: any): Promise<void> {
    try {
      this.isLoading = true;

      if (this.taskFileObject.image) {
        this._cloudinaryService.uploadImage(this.taskFileObject.image).pipe(
          catchError((error: HttpErrorResponse) => {
            alert(error.error.error.message);
            return throwError(() => { });
          }),
          finalize(() => {
            this.isLoading = false;
          }),
        ).subscribe(async (res) => {
          await addDoc(collection(this._firestore, "tasks"), {
            ...this.taskReq,
            imageURL: res.secure_url,
            imageCreatedAt: res.created_at,
            assetId: res.asset_id,
            resourceType: res.resource_type,
            type: res.type,
            publicId: res.public_id,
            signature: res.signature,
          });
          
          this._clearReq();
        });
        return;
      }

      await addDoc(collection(this._firestore, "tasks"), this.taskReq);
      this.isLoading = false;
      this._clearReq();
    } catch (e: any) {
      alert(e.message);
      this.isLoading = false;
    }
  }

  /**
   * Change Image
   * 
   * @param {any} e
   * @returns {void} 
   */
  protected changeImage(e: any): void {
    try {
      const selectedFile: File | undefined = e.target.files[0] || undefined;
      if (!selectedFile) {
        e.target.value = null;
        return;
      }

      if (!IMAGE_MIME_TYPES.includes(selectedFile.type)) {
        e.target.value = null;
        alert("Sorry, but we only accepting image format!");
        return;
      }

      if (selectedFile.size >= 100000) {
        e.target.value = null;
        alert("Sorry, but image size cannot greater than 100kb!");
        return;
      }

      this.taskFileObject.image = selectedFile;
    } catch (e: any) {
      alert(e.message);
    }
  }

  /**
   * Clear Request
   * 
   * @returns {void}
   */
  private _clearReq(): void {
    this.taskReq = {
      name: "",
      isCompleted: false,
      imageURL: "",
      imageCreatedAt: "",
      assetId: "",
      resourceType: "",
      type: "",
      publicId: "",
      signature: "",
    };
    const imageInput = document.getElementById("imageInput") as HTMLInputElement;
    if (!imageInput) return;
    imageInput.value = "";
  }
}
