import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appCommaThousands]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CommaThousandsDirective),
    multi: true
  }]
})
export class CommaThousandsDirective implements ControlValueAccessor {
  private onChange: (val: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  writeValue(value: number | string | null): void {
    const input = this.el.nativeElement;
    if (value === null || value === undefined || value === '') {
      input.value = '';
      return;
    }
    const digits = this.onlyDigits(String(value));
    input.value = this.format(digits);
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  @HostListener('input')
  handleInput() {
    const input = this.el.nativeElement;
    const raw = input.value;

    const caret = input.selectionStart ?? raw.length;
    const digitsBeforeCaret = this.onlyDigits(raw.slice(0, caret)).length;

    const digits = this.onlyDigits(raw);
    const formatted = this.format(digits);
    input.value = formatted;

    const newCaret = this.caretPosForDigitIndex(formatted, digitsBeforeCaret);
    this.setCaret(newCaret);

    const numeric = digits.length ? Number(digits) : null;
    this.onChange(numeric);
  }

  @HostListener('blur') handleBlur() { this.onTouched(); }

  @HostListener('paste', ['$event'])
  onPaste(evt: ClipboardEvent) {
    evt.preventDefault();
    const text = evt.clipboardData?.getData('text') ?? '';
    const digits = this.onlyDigits(text);
    document.execCommand('insertText', false, this.format(digits));
  }

  private onlyDigits(value: string): string {
    return value.replace(/\D+/g, '');
  }

  private format(digits: string): string {
    if (!digits) return '';
    digits = digits.replace(/^0+(?=\d)/, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private caretPosForDigitIndex(formatted: string, digitIndex: number): number {
    if (digitIndex <= 0) return 0;
    let i = 0, seen = 0;
    while (i < formatted.length) {
      if (/\d/.test(formatted[i])) {
        seen++;
        if (seen === digitIndex) return i + 1;
      }
      i++;
    }
    return formatted.length;
  }

  private setCaret(pos: number) {
    const el = this.el.nativeElement;
    requestAnimationFrame(() => el.setSelectionRange(pos, pos));
  }
}
