import { Component, OnDestroy, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

interface Task {
  wid?: string;
  isUpdateHandlerClicked?: boolean;
  name: string;
  isCompleted: boolean;
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
   * Data
   */
  protected tasks: Task[] = [];

  /**
   * Request
   */
  protected taskReq: Task = {
    name: "",
    isCompleted: false
  };

  /**
   * Subscription
   */
  private _tasksSub$!: Subscription;

  /**
   * Initialize Data
   * @param {AngularFirestore} _afs 
   */
  public constructor(
    private _afs: AngularFirestore
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
      console.log(e.message);
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
      console.log(e.message);
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
        console.log(e.message);
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
      console.log(e.message);
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
      await addDoc(collection(this._firestore, "tasks"), this.taskReq);
      this._clearReq();
    } catch (e: any) {
      console.log(e.message);
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
    };
  }
}
