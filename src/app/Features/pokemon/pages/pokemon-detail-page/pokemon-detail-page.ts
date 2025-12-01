import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from '../../services/PokemonService';

interface PokemonDetail {
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: { front_default: string };
  types: Array<{ type: { name: string } }>;
  moves: Array<any>;
  abilities: Array<{ ability: { name: string } }>;
}

@Component({
  selector: 'app-pokemon-detail-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-detail-page.html'
})
export class PokemonDetailPage implements OnInit {
  private pokemonId = signal<string>('');
  pokemonData = signal<PokemonDetail | null>(null);
  isLoading = signal(false);

  constructor(private route: ActivatedRoute, private svc: PokemonService, private router: Router) {
    effect(() => {
      const id = this.pokemonId();
      if (id) this.loadPokemon(id);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.pokemonId.set(id);
  }

  private loadPokemon(id: string): void {
    this.isLoading.set(true);
    this.svc.getById(id).subscribe({
      next: (data: any) => {
        this.pokemonData.set(data as PokemonDetail);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  back(): void { 
    this.router.navigate(['/home']); 
  }
}
