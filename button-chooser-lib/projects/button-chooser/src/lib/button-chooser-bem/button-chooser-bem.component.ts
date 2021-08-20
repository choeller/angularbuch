import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
selector: 'ch-button-chooser-bem',
templateUrl: './button-chooser-bem.component.html',
styleUrls: ['./button-chooser-bem.component.css'],
encapsulation: ViewEncapsulation.None,
changeDetection: ChangeDetectionStrategy.OnPush,
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ButtonChooserBemComponent),
    multi: true,
  }]
})
export class ButtonChooserBemComponent implements ControlValueAccessor  {

constructor(private cd: ChangeDetectorRef) {}

@Input() choices: string[] = [];

@Input() value: string = '';
@Output() valueChanged = new EventEmitter<any>();

private propagateChange = Function.prototype;
private propagateTouched = Function.prototype;

public writeValue(value: string) {
    this.value = value;
}

public registerOnChange(fn: any) {
  this.propagateChange = fn;
}

public registerOnTouched(fn: any) {
  this.propagateTouched = fn;
}

changeValue(value: string) {
  this.value = value;
  this.propagateChange(this.value);
  this.propagateTouched();
  this.valueChanged.emit(this.value);
  this.cd.detectChanges();
  return false;
}
}
