import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

const BASE = 'https://pokeapi.co/api/v2/pokemon';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  constructor(private http: HttpClient) {}

  list(offset = 0, limit = 20): Observable<any> {
    return this.http.get(`${BASE}?offset=${offset}&limit=${limit}`);
  }

  getById(id: string | number) {
    return this.http.get(`${BASE}/${id}`);
  }

  getMove(moveUrl: string) {
    return this.http.get<any>(moveUrl);
  }

  // ayuda: extraer id desde la url de result
  extractIdFromUrl(url: string) {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1];
  }
}
