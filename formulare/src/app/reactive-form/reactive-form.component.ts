import {Component} from '@angular/core';
import {FormGroup, FormArray, FormControl, FormBuilder, Validators, NgControl, AbstractControl} from '@angular/forms';
import {Task, createInitialTask, Tag} from '../models/model-interfaces';
import * as model from '../models/model-interfaces';
import {ifNotBacklogThanAssignee,  emailValidator, UserExistsValidatorDirective} from '../models/app-validators';
import {TaskService} from '../services/task-service/task.service';
import {UserService} from '../services/user.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'pjm-model-driven-form',
  templateUrl: './reactive-form.component.html'
})
export class ReactiveFormComponent {

  model = model;
  task: Task = createInitialTask();

  taskForm: FormGroup;
  taskForm2: FormGroup;
  tagsArray: FormArray;

  constructor(private taskService: TaskService,
              private userService: UserService,
              fb: FormBuilder) {
    this.taskForm = fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', Validators.maxLength(2000)],
      favorite: [false],
      state: ['BACKLOG'],
      tags: fb.array([
        this.createTagControl()
      ]),
      assignee: fb.group({
        name: ['', null, this.userExistsValidatorReused],
        email: ['', emailValidator],
      })
    }, {validator: ifNotBacklogThanAssignee});

      this.taskForm = new FormGroup(this.taskForm.controls, {
        validators: this.taskForm.validator,
        updateOn: 'blur'
      }); // Workaround für das Setzen der updateOn-Option


      this.taskForm.valueChanges.subscribe((value) => {
      Object.assign(this.task, value);
    });

    this.tagsArray = <FormArray>this.taskForm.controls['tags'];


this.taskForm2 = new FormGroup({
  title: new FormControl('', {validators: Validators.required}),
  description: new FormControl(''),
  favorite: new FormControl(false),
  state: new FormControl('BACKLOG'),
  tags: new FormArray([
    new FormGroup({
      label: new FormControl('')
    })
  ]),
  assignee: new FormGroup({
    name: new FormControl('', {
      asyncValidators: this.userExistsValidatorReused,
      updateOn: 'blur'
    }),
    email: new FormControl('', {
      validators: emailValidator
    })
  }),
}, {validators: ifNotBacklogThanAssignee, /* updateOn: 'submit' */} );
  }

  private createTagControl(): FormGroup {
    return new FormGroup({
      label: new FormControl('', Validators.minLength(3))
    });
  }

  addTag() {
    this.tagsArray.push(this.createTagControl());
    return false;
  }

  removeTag(i: number) {
    this.tagsArray.removeAt(i);
    return false;
  }

  saveTask(value: any) {
    console.log(value);
    Object.assign(this.task, value);
    this.taskService.saveTask(this.task);
  }

  loadTask(id: number) {
    const task = this.taskService.getTask(id);
    if (task.tags) {
      this.adjustTagsArray(task.tags);
    }
    this.taskForm.patchValue(task);
    this.task = task;
    return false;
  }

  private adjustTagsArray(tags: Tag[]) {
    const tagCount = tags ? tags.length : 0;
    while (tagCount > this.tagsArray.controls.length) {
      this.addTag();
    }
    while (tagCount <  this.tagsArray.controls.length) {
      this.removeTag(0);
    }
  }

  userExistsValidator = (control: AbstractControl) => {
    return this.userService.checkUserExists(control.value).pipe(
      map(checkResult => {
        return (checkResult === false) ? {userNotFound: true} : null;
      }));
  }

  userExistsValidatorReused = (control: AbstractControl) => {
    const validator = new UserExistsValidatorDirective(this.userService);
    return validator.validate(control);
  }

}



