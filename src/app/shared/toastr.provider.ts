import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

export const provideToastr = () =>
  importProvidersFrom(BrowserAnimationsModule, ToastrModule.forRoot({
    positionClass: 'toast-top-right',
    progressBar: true,
    timeOut: 3000,
    closeButton: true
  }));
