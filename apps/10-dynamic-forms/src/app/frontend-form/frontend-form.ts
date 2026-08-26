import { Component } from '@angular/core';
import {
  NbCard,
  NbCardContent,
  NbCardDescription,
  NbCardHeader,
  NbCardTitle,
  NbChip,
  NbHalftone,
  NbSticker,
  NbText,
} from '@ng-brutalism/ui';

@Component({
  selector: 'app-frontend-form',
  templateUrl: './frontend-form.html',
  imports: [
    NbCard,
    NbCardHeader,
    NbCardTitle,
    NbCardDescription,
    NbCardContent,
    NbChip,
    NbHalftone,
    NbSticker,
    NbText,
  ],
  host: {
    class: 'block w-full',
  },
})
export class FrontendForm {}
