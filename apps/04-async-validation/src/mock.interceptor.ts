import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

export function mockHttpInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  if (req.method === 'GET' && req.url.startsWith('/api/bookings/')) {
    const reference = req.url.split('/').pop() ?? '';

    return of(
      new HttpResponse({
        status: 200,
        body: {
          exists: ['ABC1234', 'DEF4567', 'GHI7890'].includes(
            reference.toUpperCase(),
          ),
        },
      }),
    );
  }

  return next(req);
}
