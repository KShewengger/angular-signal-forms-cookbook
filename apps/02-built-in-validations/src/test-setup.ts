import '@angular/localize/init';

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
