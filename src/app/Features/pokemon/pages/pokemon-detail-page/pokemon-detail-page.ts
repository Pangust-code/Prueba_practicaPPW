import { Component, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from '../../services/PokemonService';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface Stat {
  base_stat: number;
  stat: { name: string };
}

interface Move {
  name: string;
  type: string;
  power: number;
  accuracy: number;
}

interface PokemonDetail {
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: { front_default: string };
  types: Array<{ type: { name: string } }>;
  moves: Array<any>;
  abilities: Array<{ ability: { name: string } }>;
  stats: Array<Stat>;
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
  movesDetail = signal<Move[]>([]);
  isLoading = signal(false);
  private movesPerPage = 8;
  currentPage = signal(0);

  visibleMoves = computed(() => {
    const start = this.currentPage() * this.movesPerPage;
    const end = start + this.movesPerPage;
    return this.movesDetail().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.movesDetail().length / this.movesPerPage);
  });

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
    this.currentPage.set(0);
    this.svc.getById(id).subscribe({
      next: (data: any) => {
        this.pokemonData.set(data as PokemonDetail);
        this.allMoves.set(data.moves || []);
        this.loadMovesDetail(data.moves);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private allMoves = signal<any[]>([]);

  private loadMovesDetail(moves: Array<any>): void {
    const moveRequests = moves.map(m =>
      this.svc.getMove(m.move.url).pipe(
        map(moveData => ({
          name: moveData.name,
          type: moveData.type?.name || 'unknown',
          power: moveData.power || 0,
          accuracy: moveData.accuracy || 0
        })),
        catchError(() => of(null))
      )
    );

    if (moveRequests.length > 0) {
      forkJoin(moveRequests).subscribe({
        next: (movesData) => {
          const filtered = movesData.filter((m): m is Move => m !== null);
          this.movesDetail.set(filtered);
        }
      });
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  getMoveTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      normal: 'from-gray-200 to-gray-400',
      fire: 'from-red-200 to-red-400',
      water: 'from-blue-200 to-blue-400',
      electric: 'from-yellow-200 to-yellow-400',
      grass: 'from-green-200 to-green-400',
      ice: 'from-cyan-200 to-cyan-400',
      fighting: 'from-orange-200 to-orange-400',
      poison: 'from-purple-200 to-purple-400',
      ground: 'from-yellow-300 to-yellow-500',
      flying: 'from-blue-100 to-blue-300',
      psychic: 'from-pink-200 to-pink-400',
      bug: 'from-green-300 to-green-500',
      rock: 'from-gray-300 to-gray-500',
      ghost: 'from-purple-300 to-purple-500',
      dragon: 'from-indigo-200 to-indigo-400',
      dark: 'from-gray-400 to-gray-600',
      steel: 'from-slate-200 to-slate-400',
      fairy: 'from-pink-100 to-pink-300'
    };
    return `bg-linear-to-r ${colors[type.toLowerCase()] || 'from-gray-200 to-gray-400'}`;
  }

  getMoveTypeBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      normal: 'badge-neutral',
      fire: 'badge-error',
      water: 'badge-info',
      electric: 'badge-warning',
      grass: 'badge-success',
      ice: 'badge-accent',
      fighting: 'text-white',
      poison: 'text-white',
      ground: 'text-white',
      flying: 'text-white',
      psychic: 'text-white',
      bug: 'text-white',
      rock: 'text-white',
      ghost: 'text-white',
      dragon: 'text-white',
      dark: 'text-white',
      steel: 'text-white',
      fairy: 'text-white'
    };
    return classes[type.toLowerCase()] || 'badge-neutral';
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      normal: 'from-gray-200 to-gray-400',
      fire: 'from-red-200 to-red-400',
      water: 'from-blue-200 to-blue-400',
      electric: 'from-yellow-200 to-yellow-400',
      grass: 'from-green-200 to-green-400',
      ice: 'from-cyan-200 to-cyan-400',
      fighting: 'from-orange-200 to-orange-400',
      poison: 'from-purple-200 to-purple-400',
      ground: 'from-yellow-300 to-yellow-500',
      flying: 'from-blue-100 to-blue-300',
      psychic: 'from-pink-200 to-pink-400',
      bug: 'from-green-300 to-green-500',
      rock: 'from-gray-300 to-gray-500',
      ghost: 'from-purple-300 to-purple-500',
      dragon: 'from-indigo-200 to-indigo-400',
      dark: 'from-gray-400 to-gray-600',
      steel: 'from-slate-200 to-slate-400',
      fairy: 'from-pink-100 to-pink-300'
    };
    return `bg-linear-to-r ${colors[type.toLowerCase()] || 'from-gray-200 to-gray-400'}`;
  }

  getAbilityColor(ability: string): string {
    const colors = [
      'from-purple-200 to-purple-400',
      'from-blue-200 to-blue-400',
      'from-pink-200 to-pink-400',
      'from-green-200 to-green-400',
      'from-yellow-200 to-yellow-400',
      'from-indigo-200 to-indigo-400',
      'from-rose-200 to-rose-400',
      'from-cyan-200 to-cyan-400'
    ];
    let hash = 0;
    for (let i = 0; i < ability.length; i++) {
      hash = ability.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `bg-linear-to-r ${colors[Math.abs(hash) % colors.length]}`;
  }

  back(): void {
    const offsetParam = this.route.snapshot.queryParamMap.get('offset');
    const query: any = {};
    if (offsetParam !== null && !isNaN(Number(offsetParam))) {
      query.offset = Number(offsetParam);
    }
    this.router.navigate(['/home'], { queryParams: query });
  }
}
