import { Component } from '@angular/core';
import { NgOptimizedImage, DecimalPipe } from '@angular/common';
import {
  NbAvatar,
  NbBadge,
  NbButton,
  NbButtonTrailingIcon,
  NbCallout,
  NbCard,
  NbCardActions,
  NbCardContent,
  NbCardDescription,
  NbCardHeader,
  NbCardTitle,
  NbCluster,
  NbDisplay,
  NbHalftone,
  NbSeparator,
  NbSplit,
  NbStack,
  NbSticker,
  NbText,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBrandGithub } from '@ng-icons/tabler-icons';
import { tablerCircleArrowRightFill } from '@ng-icons/tabler-icons/fill';
import { SIGNAL_EXAMPLES } from './app.data';

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
    NbSticker,
    NbSplit,
    NbAvatar,
    DecimalPipe,
    NbButtonTrailingIcon,
  ],
  providers: [provideIcons({ tablerBrandGithub, tablerCircleArrowRightFill })],
  host: {
    class: 'mx-auto flex flex-col items-center gap-8 justify-center w-full',
  },
})
export class App {
  protected readonly examples = SIGNAL_EXAMPLES;
}
