import { Inject, Injectable } from '@angular/core';
import { Task } from '../../models/model-interfaces';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { TaskStore } from '../stores/task.store';
import { ActionType, ADD, EDIT, LOAD, REMOVE } from '../stores/action';
import { SOCKET_IO } from '../../app.tokens';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Action } from '../stores/action';

const BASE_URL = `http://localhost:3000/api/tasks/`;

const WEB_SOCKET_URL = 'http://localhost:3001';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  socket: SocketIOClient.Socket;

  tasksChanged = new BehaviorSubject({});

  constructor(private http: HttpClient, private taskStore: TaskStore,
              @Inject(SOCKET_IO) socketIO: SocketIOClientStatic) {

    this.socket = socketIO(WEB_SOCKET_URL);
    fromEvent<Action>(this.socket, 'task_saved')
      .subscribe((action) => {
        this.taskStore.dispatch(action);
      });
  }

  selectTasks() {
    return this.taskStore.selectItems();
  }

  findTasks(query = '', sort = 'id', order = 'ASC') {
    const searchParams = new HttpParams()
      .append('q', query)
      .append('_sort', sort)
      .append('_order', order);

    this.http.get(BASE_URL, {params: searchParams}).pipe(
      tap((tasks) => {
        this.taskStore.dispatch({type: LOAD, data: tasks});
      })).subscribe();

    return this.taskStore.selectItems();
  }

  getTask(id: number | string): Observable<Task> {
    return this.http.get<Task>(BASE_URL + id);
  }


  saveTask(task: Task) {
    const method = task.id ? 'PUT' : 'POST';
    return this.http.request(method, BASE_URL + (task.id || ''), {
      body: task
    }).pipe(
      tap(savedTask => {
        this.tasksChanged.next(savedTask);
        const actionType: ActionType = task.id ? EDIT : ADD;
        const action = {type: actionType, data: savedTask};
        this.taskStore.dispatch(action);
        this.socket.emit('broadcast_task', action);
      }));
  }

  deleteTask(task: Task) {
    return this.http.delete(BASE_URL + task.id).pipe(
      tap(_ => {
        this.taskStore.dispatch({type: REMOVE, data: task});
      }));
  }
}

