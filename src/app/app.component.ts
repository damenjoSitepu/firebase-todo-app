import { Component, OnDestroy, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Subscription, catchError, finalize, throwError } from 'rxjs';
import { CloudinaryService } from './services/cloudinary.service';
import { IMAGE_MIME_TYPES } from './constants/image-types.const';
import { HttpErrorResponse } from '@angular/common/http';

interface Task {
  wid?: string;
  isUpdateHandlerClicked?: boolean;
  name: string;
  isCompleted: boolean;
  imageURL?: string;
  imageObj?: File;
};

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
  protected tasks: Task[] = [];

  /**
   * Request
   */
  protected taskReq: Task = {
    name: "",
    isCompleted: false,
    imageObj: undefined,
    imageURL: "",
  };

  /**
   * Subscription
   */
  private _tasksSub$!: Subscription;

  /**
   * Initialize Data
   * @param {AngularFirestore} _afs 
   * @param {CloudinaryService} _cloudinaryService
   */
  public constructor(
    private _afs: AngularFirestore,
    private _cloudinaryService: CloudinaryService
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
        if (tasks.length === 0) return;
        this.tasks = (tasks as Task[]).map((task: Task) => {
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
    try {
      await deleteDoc(doc(this._firestore, `tasks/${wid}`));
    } catch (e: any) {
      alert(e.message);
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
        const task: Task | undefined = this.tasks.find((task: Task) => task.wid === wid);
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
      this.tasks = [...this.tasks].map((task: Task) => {
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

      if (this.taskReq.imageObj) {
        this._cloudinaryService.uploadImage(this.taskReq.imageObj).pipe(
          catchError((error: HttpErrorResponse) => {
            alert(error.error.error.message);
            return throwError(() => { });
          }),
          finalize(() => {
            this.isLoading = false;
          }),
        ).subscribe(async (res) => {
          await addDoc(collection(this._firestore, "tasks"), {
            name: this.taskReq.name,
            isCompleted: this.taskReq.isCompleted,
            imageURL: res.secure_url,
          });
          this._clearReq();
        });
        return;
      }

      await addDoc(collection(this._firestore, "tasks"), {
        name: this.taskReq.name,
        isCompleted: this.taskReq.isCompleted,
      });
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

      this.taskReq.imageObj = selectedFile;
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
      imageObj: undefined,
      imageURL: "",
    };
    const imageInput = document.getElementById("imageInput") as HTMLInputElement;
    if (!imageInput) return;
    imageInput.value = "";
  }
}
