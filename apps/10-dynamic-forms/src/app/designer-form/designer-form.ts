import { Component } from '@angular/core';
import {
  NbCard,
  NbCardContent,
  NbCardDescription,
  NbCardHeader,
  NbCardTitle,
  NbHalftone,
  NbSticker,
  NbText,
} from '@ng-brutalism/ui';

@Component({
  selector: 'app-designer-form',
  templateUrl: './designer-form.html',
  imports: [
    NbCard,
    NbCardHeader,
    NbCardTitle,
    NbCardDescription,
    NbCardContent,
    NbHalftone,
    NbSticker,
    NbText,
  ],
  host: {
    class: 'block w-full',
  },
})
export class DesignerForm {}
