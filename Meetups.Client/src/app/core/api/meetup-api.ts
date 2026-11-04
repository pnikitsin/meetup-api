import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Meetup, MeetupInput } from '../models/meetup';

@Injectable({ providedIn: 'root' })
export class MeetupApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/meetup`;

  getAll(): Observable<Meetup[]> {
    return this.http.get<Meetup[]>(this.baseUrl);
  }

  getById(id: string): Observable<Meetup> {
    return this.http.get<Meetup>(`${this.baseUrl}/${id}`);
  }

  create(payload: MeetupInput): Observable<Meetup> {
    return this.http.post<Meetup>(this.baseUrl, payload);
  }

  /** Backend принимает id в query string: PUT /api/meetup?id=... */
  update(id: string, payload: MeetupInput): Observable<Meetup> {
    return this.http.put<Meetup>(`${this.baseUrl}?id=${encodeURIComponent(id)}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
