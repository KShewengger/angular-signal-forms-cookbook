import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {
  NbBadge,
  NbCallout,
  NbCard,
  NbCardDescription,
  NbCardHeader,
  NbCardTitle,
  NbCluster,
  NbDisplay,
  NbHalftone,
  NbMediaFrame,
  NbSeparator,
  NbStack,
  NbSticker,
  NbText,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBrandGithub } from '@ng-icons/tabler-icons';
import { SIGNAL_EXAMPLES } from './app.data';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.scss',
  imports: [
    NbCard,
    NbCardHeader,
    NbCardTitle,
    NbCardDescription,
    NbStack,
    NbBadge,
    NbDisplay,
    NbCallout,
    NbCluster,
    NgOptimizedImage,
    NbText,
    NbSeparator,
    NgIcon,
    NbHalftone,
    NbMediaFrame,
    NbSticker,
  ],
  providers: [provideIcons({ tablerBrandGithub })],
  host: {
    class: 'mx-auto flex flex-col items-center gap-8 justify-center w-full',
  },
})
export class App {
  protected readonly examples = SIGNAL_EXAMPLES;
}
