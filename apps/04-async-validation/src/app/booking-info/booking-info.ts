import { Component, input, output } from '@angular/core';
import {
  NbButton,
  NbCluster,
  NbStack,
  NbText,
  NbSection,
  NbSplit,
  NbMediaFrame,
  NbStatusDot,
  NbHalftone,
  NbTitle,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  tablerArrowLeft,
  tablerPlaneDeparture,
  tablerPlaneArrival,
  tablerNotebook,
} from '@ng-icons/tabler-icons';
import { UserBooking } from '../app.model';

@Component({
  selector: 'app-booking-info',
  templateUrl: 'booking-info.html',
  imports: [
    NgIcon,
    NbTitle,
    NbStatusDot,
    NbSplit,
    NbSection,
    NbStack,
    NbCluster,
    NbButton,
    NbText,
    NbMediaFrame,
    NbHalftone,
  ],
  providers: [
    provideIcons({
      tablerArrowLeft,
      tablerPlaneDeparture,
      tablerPlaneArrival,
      tablerNotebook,
    }),
  ],
})
export class BookingInfo {
  readonly booking = input.required<UserBooking>();
  readonly back = output();
}
