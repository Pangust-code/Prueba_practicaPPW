import { Component, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PokemonService } from '../../services/PokemonService';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface PokemonItem {
  name: string;
  url: string;
  image?: string;
}

interface PokemonResponse {
  count: number;
  results: Array<PokemonItem>;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.html'
})
export class HomePage implements OnInit {
  offset = signal(0);
  limit = 20;

  pokemonData = signal<PokemonResponse | null>(null);
  isLoading = signal(false);

  items = computed(() => this.pokemonData()?.results || []);
  total = computed(() => this.pokemonData()?.count || 0);
  lastPageStart = computed(() => Math.max(0, Math.floor((this.total() - 1) / this.limit) * this.limit));

  constructor(private svc: PokemonService, private router: Router, private route: ActivatedRoute) {
    effect(() => {
      const offset = this.offset();
      this.loadPokemon(offset);
    });
    // react to query param changes so when navigating back from detail
    // with ?offset=... we restore the page correctly even if Home was reused
    this.route.queryParamMap.subscribe(map => {
      const param = map.get('offset');
      if (param !== null && !isNaN(Number(param))) {
        const value = Number(param);
        if (this.offset() !== value) {
          this.offset.set(value);
        }
      }
    });
  }

  ngOnInit(): void {
    const param = this.route.snapshot.queryParamMap.get('offset');
    if (param !== null && !isNaN(Number(param))) {
      this.offset.set(Number(param));
    }
  }

  private loadPokemon(offset: number): void {
    this.isLoading.set(true);
    this.svc.list(offset, this.limit).subscribe({
      next: (data: any) => {
        this.pokemonData.set(data);
        this.loadPokemonImages(data.results);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private loadPokemonImages(results: Array<PokemonItem>): void {
    const imageRequests = results.map(pokemon =>
      this.svc.getById(pokemon.name).pipe(
        map((pokemonDetail: any) => ({
          ...pokemon,
          image: pokemonDetail.sprites?.front_default || ''
        })),
        catchError(() => of(pokemon))
      )
    );

    if (imageRequests.length > 0) {
      forkJoin(imageRequests).subscribe({
        next: (pokemonWithImages) => {
          const currentData = this.pokemonData();
          if (currentData) {
            this.pokemonData.set({
              ...currentData,
              results: pokemonWithImages
            });
          }
        }
      });
    }
  }

  next(): void {
    const newOffset = this.offset() + this.limit;
    if (newOffset < this.total()) {
      this.offset.set(newOffset);
    }
  }

  prev(): void {
    const newOffset = Math.max(0, this.offset() - this.limit);
    this.offset.set(newOffset);
  }

  jumpPages(pages: number): void {
    const delta = pages * this.limit;
    const desired = this.offset() + delta;
    const lastStart = this.lastPageStart();
    const clamped = Math.min(Math.max(0, desired), lastStart);
    this.offset.set(clamped);
  }

  jumpForward5(): void {
    this.jumpPages(5);
  }

  jumpBackward5(): void {
    this.jumpPages(-5);
  }

  goToFirstPage(): void {
    this.offset.set(0);
  }

  goToDetail(url: string): void {
    const id = this.svc.extractIdFromUrl(url);
    this.router.navigate(['/pokemon', id], { queryParams: { offset: this.offset() } });
  }
}
