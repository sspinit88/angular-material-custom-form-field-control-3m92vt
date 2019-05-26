import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  styleUrls: ['./form-field.component.scss'],
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
  phone: FormControl = new FormControl(null, {
    updateOn: 'blur',
    validators: [Validators.required],
  });

  constructor() {
    this.phone.valueChanges.subscribe(phone => console.log('phone', phone));
  }
}
