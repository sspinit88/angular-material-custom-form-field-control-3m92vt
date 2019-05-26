import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { PhoneControlComponent } from './phone-control.component';

@NgModule({
  declarations: [PhoneControlComponent],
  exports: [PhoneControlComponent],
  imports: [
    SharedModule,
  ],
})
export class PhoneControlModule {}
