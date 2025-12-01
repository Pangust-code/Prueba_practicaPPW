import { Component, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PokemonService } from '../../services/PokemonService';

interface PokemonResponse {
  count: number;
  results: Array<{ name: string; url: string }>;
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

  constructor(private svc: PokemonService, private router: Router) {
    effect(() => {
      const offset = this.offset();
      this.loadPokemon(offset);
    });
  }

  ngOnInit(): void {}

  private loadPokemon(offset: number): void {
    this.isLoading.set(true);
    this.svc.list(offset, this.limit).subscribe({
      next: (data: any) => {
        this.pokemonData.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
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

  goToDetail(url: string): void {
    const id = this.svc.extractIdFromUrl(url);
    this.router.navigate(['/pokemon', id]);
  }
}
