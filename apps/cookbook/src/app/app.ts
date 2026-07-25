import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {
  NbBadge,
  NbButton, NbCallout,
  NbCard,
  NbCardActions,
  NbCardContent,
  NbCardDescription,
  NbCardHeader,
  NbCardTitle, NbCluster, NbDisplay, NbHalftone, NbSeparator, NbStack, NbSticker, NbText
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBrandGithub } from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  imports: [
    NbCard,
    NbCardHeader,
    NbCardTitle,
    NbCardDescription,
    NbCardContent,
    NbCardActions,
    NbButton,
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
    NbSticker
  ],
  providers: [
    provideIcons({ tablerBrandGithub })
  ],
  host: {
    class: 'mx-auto flex justify-center w-full'
  }
})
export class App {
  protected title = 'cookbook';
}
