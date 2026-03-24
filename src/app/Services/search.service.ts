import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private termSubject = new BehaviorSubject<string>('');
  term$ = this.termSubject.asObservable();

  setTerm(term: string): void { this.termSubject.next(term); }
  clearTerm(): void         { this.termSubject.next(''); }
  getTerm(): string         { return this.termSubject.value; }
}
