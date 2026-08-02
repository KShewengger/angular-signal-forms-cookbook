import '@angular/localize/init';

/**
 * jsdom does not implement the native `<dialog>` methods (`show`, `showModal`,
 * `close`) that ng-brutalism's `NbDialog` calls under the hood. Stub them so
 * components that open or close a dialog can be exercised in unit tests.
 */
const dialogProto = globalThis.HTMLDialogElement?.prototype;
if (dialogProto) {
  if (!dialogProto.show) {
    dialogProto.show = function (this: HTMLDialogElement): void {
      this.open = true;
    };
  }
  if (!dialogProto.showModal) {
    dialogProto.showModal = function (this: HTMLDialogElement): void {
      this.open = true;
    };
  }
  if (!dialogProto.close) {
    dialogProto.close = function (this: HTMLDialogElement): void {
      this.open = false;
    };
  }
}
