import { Component, output } from '@angular/core';
import { NbButton, NbCluster, NbSurface, NbText } from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerRefresh } from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-submitted-banner',
  templateUrl: './submitted-banner.html',
  imports: [NbButton, NbCluster, NbSurface, NbText, NgIcon],
  viewProviders: [provideIcons({ tablerRefresh })],
  host: {
    class: 'block w-full',
  },
})
export class SubmittedBanner {
  readonly retry = output();
}
