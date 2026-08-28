import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'relative mx-auto flex w-2xl max-w-full shrink-0 flex-col gap-4',
  },
})
export class App {}
