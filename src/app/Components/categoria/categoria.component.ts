import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../Services/cart.service';

export interface CatProduct {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  sizes: string[];
  badge?: string;
}

interface CategoryData {
  title: string;
  subtitle: string;
  description: string;
  products: CatProduct[];
}

// ─── DATOS MOCK ─────────────────────────────────────────────────────────────
// TODO: reemplazar con llamada a API / base de datos
const CATEGORIES: Record<string, CategoryData> = {
  nuevo: {
    title: 'Nuevo',
    subtitle: 'NOVEDADES',
    description: 'Los últimos lanzamientos recién llegados a CHAAC XANAB.',
    products: [
      {
        name: 'Air Max 97',
        price: 3200,
        image: 'assets/product1.jpg',
        description: 'Diseño icónico inspirado en el tren bala japonés',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'new'
      },
      {
        name: 'Pegasus 41',
        price: 2850,
        image: 'assets/product2.jpg',
        description: 'Amortiguación Air para correr sin límites',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'new'
      },
      {
        name: 'Mercurial Vapor 16',
        price: 3500,
        image: 'assets/product3.jpg',
        description: 'Velocidad pura para la cancha',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'new'
      },
      {
        name: 'Vomero 18',
        price: 2950,
        image: 'assets/product4.jpg',
        description: 'Máxima amortiguación para largas distancias',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'new'
      },
      {
        name: 'Court Legacy',
        price: 1890,
        image: 'assets/product5.jpg',
        description: 'Estilo clásico para el día a día',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'new'
      },
      {
        name: 'Infinity Run 4',
        price: 3100,
        image: 'assets/product6.jpg',
        description: 'Estabilidad y confort en cada zancada',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'new'
      }
    ]
  },

  hombre: {
    title: 'Hombre',
    subtitle: 'COLECCIÓN HOMBRE',
    description: 'Calzado diseñado para el hombre en movimiento.',
    products: [
      {
        name: 'Air Force 1 High',
        price: 2400,
        image: 'assets/product1.jpg',
        description: 'El clásico que nunca pasa de moda',
        sizes: ['25', '26', '27', '28', '29', '30'],
        badge: 'popular'
      },
      {
        name: 'Jordan Retro 4',
        price: 3800,
        image: 'assets/product2.jpg',
        description: 'Legado del básquetbol en versión retro',
        sizes: ['25', '26', '27', '28', '29', '30'],
        badge: 'popular'
      },
      {
        name: 'LeBron 21',
        price: 3200,
        image: 'assets/product3.jpg',
        description: 'Rendimiento élite para la cancha',
        sizes: ['25', '26', '27', '28', '29', '30']
      },
      {
        name: 'Dunk High Pro',
        price: 2700,
        image: 'assets/product4.jpg',
        description: 'Soporte alto con estilo urbano',
        sizes: ['25', '26', '27', '28', '29', '30']
      },
      {
        name: 'Air Max 90',
        price: 2500,
        image: 'assets/product5.jpg',
        description: 'Comodidad clásica de los 90s',
        sizes: ['25', '26', '27', '28', '29', '30'],
        badge: 'popular'
      },
      {
        name: 'React Infinity Run',
        price: 2950,
        image: 'assets/product6.jpg',
        description: 'Tecnología React para el corredor moderno',
        sizes: ['25', '26', '27', '28', '29', '30']
      }
    ]
  },

  mujer: {
    title: 'Mujer',
    subtitle: 'COLECCIÓN MUJER',
    description: 'Estilo, comodidad y rendimiento para cada momento.',
    products: [
      {
        name: 'Air Max 270 React',
        price: 2600,
        image: 'assets/product1.jpg',
        description: 'La mayor unidad de Air en el talón',
        sizes: ['22', '23', '24', '25', '26', '27'],
        badge: 'new'
      },
      {
        name: 'Free Run Flyknit',
        price: 2100,
        image: 'assets/product2.jpg',
        description: 'Movimiento natural con tejido ultraligero',
        sizes: ['22', '23', '24', '25', '26', '27']
      },
      {
        name: 'Air Zoom Pegasus',
        price: 2450,
        image: 'assets/product3.jpg',
        description: 'El favorito de millones de corredoras',
        sizes: ['22', '23', '24', '25', '26', '27'],
        badge: 'popular'
      },
      {
        name: 'Blazer Mid Vintage',
        price: 2200,
        image: 'assets/product4.jpg',
        description: 'Silueta vintage con toque contemporáneo',
        sizes: ['22', '23', '24', '25', '26', '27']
      },
      {
        name: 'Revolution 7',
        price: 1750,
        image: 'assets/product5.jpg',
        description: 'Diseño versátil para gym o calle',
        sizes: ['22', '23', '24', '25', '26', '27']
      },
      {
        name: 'Court Vision Alta',
        price: 1980,
        image: 'assets/product6.jpg',
        description: 'Plataforma elevada para mayor estatura',
        sizes: ['22', '23', '24', '25', '26', '27'],
        badge: 'new'
      }
    ]
  },

  ninos: {
    title: 'Niños',
    subtitle: 'COLECCIÓN NIÑOS',
    description: 'Calzado resistente y cómodo para los pequeños aventureros.',
    products: [
      {
        name: 'Air Max 90 Kids',
        price: 1800,
        image: 'assets/product1.jpg',
        description: 'El clásico en talla para niños',
        sizes: ['16', '17', '18', '19', '20', '21'],
        badge: 'popular'
      },
      {
        name: 'Force 1 Kids',
        price: 1500,
        image: 'assets/product2.jpg',
        description: 'El icónico en versión junior',
        sizes: ['16', '17', '18', '19', '20', '21'],
        badge: 'popular'
      },
      {
        name: 'Revolution 6 Next Nature',
        price: 1200,
        image: 'assets/product3.jpg',
        description: 'Materiales sostenibles y super cómodo',
        sizes: ['16', '17', '18', '19', '20', '21']
      },
      {
        name: 'Pico 5 Kids',
        price: 980,
        image: 'assets/product4.jpg',
        description: 'Velcro y resistencia para el recreo',
        sizes: ['14', '15', '16', '17', '18']
      },
      {
        name: 'Flex Runner 2',
        price: 1150,
        image: 'assets/product5.jpg',
        description: 'Flexible y sin agujetas para los más activos',
        sizes: ['16', '17', '18', '19', '20', '21'],
        badge: 'new'
      },
      {
        name: 'Waffle Debut',
        price: 1300,
        image: 'assets/product6.jpg',
        description: 'Suela waffle de inspiración retro',
        sizes: ['16', '17', '18', '19', '20', '21']
      }
    ]
  },

  ofertas: {
    title: 'Ofertas',
    subtitle: 'OFERTAS ESPECIALES',
    description: 'Aprovecha los mejores precios en calzado seleccionado.',
    products: [
      {
        name: 'Downshifter 12',
        price: 1290,
        originalPrice: 1890,
        image: 'assets/product1.jpg',
        description: 'Ligero y transpirable para correr',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'sale'
      },
      {
        name: 'Court Vision Low',
        price: 1490,
        originalPrice: 2100,
        image: 'assets/product2.jpg',
        description: 'Estilo básquetbol para uso diario',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'sale'
      },
      {
        name: 'Revolution 5',
        price: 990,
        originalPrice: 1500,
        image: 'assets/product3.jpg',
        description: 'Versatilidad a precio accesible',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'sale'
      },
      {
        name: 'Tanjun',
        price: 1100,
        originalPrice: 1600,
        image: 'assets/product4.jpg',
        description: 'Minimalista y liviano para el día a día',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'sale'
      },
      {
        name: 'Renew Run 3',
        price: 1380,
        originalPrice: 1950,
        image: 'assets/product5.jpg',
        description: 'Amortiguación cómoda para el diario',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'sale'
      },
      {
        name: 'Flex Experience 12',
        price: 1050,
        originalPrice: 1480,
        image: 'assets/product6.jpg',
        description: 'Flexibilidad total a precio reducido',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'sale'
      }
    ]
  },

  snkrs: {
    title: 'SNKRS',
    subtitle: 'SNKRS EXCLUSIVOS',
    description: 'Las colaboraciones y ediciones limitadas más buscadas.',
    products: [
      {
        name: 'Travis Scott x Nike',
        price: 8500,
        image: 'assets/product1.jpg',
        description: 'Colaboración icónica con el artista de Houston',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'popular'
      },
      {
        name: 'Off-White Dunk Low',
        price: 6800,
        image: 'assets/product2.jpg',
        description: 'Virgil Abloh reimagina el clásico Dunk',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'popular'
      },
      {
        name: 'Fragment AF1',
        price: 7200,
        image: 'assets/product3.jpg',
        description: 'Collab con Fragment Design de Japón',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'new'
      },
      {
        name: 'Sacai Waffle',
        price: 5600,
        image: 'assets/product4.jpg',
        description: 'Doble suela en una fusión avant-garde',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'new'
      },
      {
        name: 'CLOT Air Max 1',
        price: 4900,
        image: 'assets/product5.jpg',
        description: 'Edición especial Kiss of Death',
        sizes: ['25', '26', '27', '28', '29']
      },
      {
        name: 'Union Jordan 4',
        price: 7800,
        image: 'assets/product6.jpg',
        description: 'Union LA reinterpreta la leyenda Jordan',
        sizes: ['25', '26', '27', '28', '29'],
        badge: 'popular'
      }
    ]
  }
};
// ─── FIN DATOS MOCK ──────────────────────────────────────────────────────────

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent implements OnInit, OnDestroy {
  slug = '';
  categoryData: CategoryData | null = null;
  selectedSizes: Record<string, string> = {};
  addedToCart: Record<string, boolean> = {};

  private routeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    public cartService: CartService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.slug = params.get('categoria') || '';
      this.categoryData = CATEGORIES[this.slug] || null;
      this.selectedSizes = {};
      this.addedToCart = {};
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  addToCart(product: CatProduct, size: string): void {
    if (!size) return;
    this.cartService.addToCart(product, size);
    const key = product.name + size;
    this.addedToCart[key] = true;
    setTimeout(() => { this.addedToCart[key] = false; }, 1500);
  }

  getDiscount(product: CatProduct): number {
    if (!product.originalPrice) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }
}
