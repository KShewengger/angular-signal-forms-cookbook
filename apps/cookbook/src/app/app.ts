import { Component } from '@angular/core';
import { NgOptimizedImage, DecimalPipe, NgClass } from '@angular/common';
import {
  NbAvatar,
  NbBadge,
  NbButton,
  NbButtonTrailingIcon,
  NbCallout,
  NbCard,
  NbCardDescription,
  NbCardHeader,
  NbCardTitle,
  NbCluster,
  NbDisplay,
  NbHalftone,
  NbSeparator,
  NbStack,
  NbSticker,
  NbText,
  NbTitle,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBrandGithub } from '@ng-icons/tabler-icons';
import { tablerCircleArrowRightFill } from '@ng-icons/tabler-icons/fill';
import { SIGNAL_EXAMPLES, TONE_RAIL, TONE_TINT, TONE_WAVE } from './app.data';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [
    NbCard,
    NbCardHeader,
    NbCardTitle,
    NbCardDescription,
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
    NbTitle,
    NbAvatar,
    DecimalPipe,
    NbButtonTrailingIcon,
    NgClass,
  ],
  providers: [provideIcons({ tablerBrandGithub, tablerCircleArrowRightFill })],
  host: {
    class: 'mx-auto flex flex-col items-center gap-8 justify-center w-full',
  },
})
export class App {
  protected readonly examples = SIGNAL_EXAMPLES;
  protected readonly toneRail = TONE_RAIL;
  protected readonly toneTint = TONE_TINT;
  protected readonly toneWave = TONE_WAVE;
}
