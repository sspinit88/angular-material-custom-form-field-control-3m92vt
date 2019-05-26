import { FocusMonitor } from '@angular/cdk/a11y';
import { AutofillMonitor } from '@angular/cdk/text-field';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NgControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatFormFieldControl } from '@angular/material';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { PhoneNumber } from './phone-number';

@Component({
  host: {
    '(focusout)': 'onTouched()',
  },
  providers: [
    { provide: MatFormFieldControl, useExisting: PhoneControlComponent },
  ],
  selector: 'phone-control',
  styleUrls: ['./phone-control.component.scss'],
  templateUrl: './phone-control.component.html',
})
export class PhoneControlComponent implements AfterViewInit,
  ControlValueAccessor, MatFormFieldControl<PhoneNumber>,
  OnDestroy {
  static nextId: number = 0;

  private _disabled: boolean = false;
  private _focused: boolean = false;
  private _placeholder: string = '';
  private _required: boolean = false;
  private destroy: Subject<void> = new Subject();

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  @Input()
  get value(): PhoneNumber {
    const n = this.parts.value;

    if (n.area.length == 3 && n.exchange.length == 3 && n.subscriber.length == 4) {
      return new PhoneNumber(n.area, n.exchange, n.subscriber);
    }

    return null;
  }
  set value(value: PhoneNumber) {
    const { area, exchange, subscriber } = value || new PhoneNumber();

    this.parts.setValue({ area, exchange, subscriber });
    this.stateChanges.next();
  }

  @HostBinding('attr.aria-describedby')
  describedBy: string = '';
  @HostBinding()
  id = `phone-control-${++PhoneControlComponent.nextId}`;
  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  @ViewChild('area', { read: ElementRef })
  areaRef: ElementRef<HTMLInputElement>;
  @ViewChild('exchange', { read: ElementRef })
  exchangeRef: ElementRef<HTMLInputElement>;
  @ViewChild('subscriber', { read: ElementRef })
  subscriberRef: ElementRef<HTMLInputElement>;

  autofilled: boolean = false;
  controlType: string = 'phone';
  get empty(): boolean {
    const n: PhoneNumber = this.parts.value;

    return !n.area && !n.exchange && !n.subscriber;
  }
  get errorState(): boolean {
    return (this.ngControl.control != null)
      ? !!this.ngControl.control
      : false;
  }
  get focused(): boolean {
    return this._focused;
  }
  set focused(value: boolean) {
    this._focused = value;
    this.stateChanges.next();
  }
  parts: FormGroup = new FormGroup({
    area: new FormControl(''),
    exchange: new FormControl(''),
    subscriber: new FormControl(''),
  });
  stateChanges: Subject<void> = new Subject();

  constructor(
    private focusMonitor: FocusMonitor,
    private elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl | null,
    private autofillMonitor: AutofillMonitor,
  ) {
    if (ngControl) {
      // Set the value accessor directly (instead of providing
      // NG_VALUE_ACCESSOR) to avoid running into a circular import
      this.ngControl.valueAccessor = this;
      ngControl.valueAccessor = this;
    }
  }

  ngAfterViewInit(): void {
    this.focusMonitor.monitor(this.elementRef.nativeElement, true)
      .subscribe(focusOrigin => {
        this.focused = !!focusOrigin;
      });
    combineLatest(
      this.observeAutofill(this.areaRef),
      this.observeAutofill(this.exchangeRef),
      this.observeAutofill(this.subscriberRef),
    ).pipe(
      map(autofills => autofills.some(autofilled => autofilled)),
      takeUntil(this.destroy),
    ).subscribe(autofilled => this.autofilled = autofilled);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    this.autofillMonitor.stopMonitoring(this.areaRef);
    this.autofillMonitor.stopMonitoring(this.exchangeRef);
    this.autofillMonitor.stopMonitoring(this.subscriberRef);
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.focusMonitor.focusVia(this.areaRef.nativeElement, 'mouse');
    }
  }

  onTouched(): void {}

  registerOnChange(onChange: (value: PhoneNumber | null) => void): void {
    this.parts.valueChanges.pipe(
      takeUntil(this.destroy),
    ).subscribe(onChange);
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  setDisabledState(shouldDisable: boolean): void {
    if (shouldDisable) {
      this.parts.disable();
    } else {
      this.parts.enable();
    }

    this.disabled = shouldDisable;
  }

  writeValue(value: PhoneNumber | null): void {
    value = value || new PhoneNumber();

    this.parts.setValue(value, { emitEvent: false });
  }

  private observeAutofill(ref: ElementRef): Observable<boolean> {
    return this.autofillMonitor.monitor(ref)
      .pipe(map(event => event.isAutofilled))
      .pipe(startWith(false));
  }
}
