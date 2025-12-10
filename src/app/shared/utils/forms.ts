import { AbstractControl } from '@angular/forms';

export function getControlError(control: AbstractControl | null | undefined): string | null {
  if (!control || !control.touched || control.valid) return null;

  if (control.hasError('required')) return 'This field is required';
  if (control.hasError('email')) return 'Enter a valid email';
  if (control.hasError('minlength')) return 'Must be longer';
  return 'Invalid value';
}
