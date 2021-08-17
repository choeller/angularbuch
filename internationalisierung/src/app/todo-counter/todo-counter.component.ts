import {Component, Input} from '@angular/core';
import {NgLocalization} from '@angular/common';


export class TodoCountLocalization extends NgLocalization {
  getPluralCategory(count: number) {
    if (count >= 5 && count < 10) {
      return 'few';
    } else if (count >= 10) {
      return 'many';
    } else {
      return 'other';
    }
  }
}

@Component({
  selector: 'ch-todo-counter',
  templateUrl: 'todo-counter.component.html',
  styleUrls: ['todo-counter.component.css'],
  providers: [{provide: NgLocalization, useClass: TodoCountLocalization}]
})
export class TodoCounterComponent {
  @Input() count: number;

  ngOnInit() {
    const m = $localize `Hallo Welt!`;
    console.log(m)
  }

  todoTextsMapping = {
    "=0" : "Alle Aufgaben erledigt",
    "=1" : "Eine Aufgabe",
    "other" : "# Aufgaben",
    "few" : "Einige Aufgaben",
    "many" : "Mehr als 10 Aufgaben",
  };

}

