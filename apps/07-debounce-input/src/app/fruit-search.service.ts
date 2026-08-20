import { Service } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { FRUITS } from './app.data';
import type { Fruit } from './app.model';

@Service()
export class FruitSearch {
  search(query: string): Observable<Fruit[]> {
    const q = query.trim().toLowerCase();
    const matches = FRUITS.filter((fruit) =>
      fruit.name.toLowerCase().includes(q),
    );

    return of(matches).pipe(delay(600));
  }
}
