import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { PhoneControlModule } from '../phone-control';
import { SharedModule, MaterialModule } from '../shared';
import { FormFieldComponent } from './form-field.component';

@NgModule({
  declarations: [FormFieldComponent],
  exports: [FormFieldComponent],
  imports: [
    SharedModule,
    MaterialModule,
    PhoneControlModule,
  ],
})
export class FormFieldModule {}
