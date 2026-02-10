import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  name: string;
  price: number;
  image: string;
  description: string;
}

interface Category {
  title: string;
  subtitle: string;
  image: string;
  keywords: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CHAAC XANAB';
  searchTerm: string = '';
  isSearching: boolean = false;

  categories: Category[] = [
    {
      title: 'Running',
      subtitle: 'Conquista cada kilómetro',
      image: 'assets/categoria-running.jpg',
      keywords: ['running', 'correr', 'kilómetro', 'deportivo']
    },
    {
      title: 'Básquetbol',
      subtitle: 'Domina la cancha',
      image: 'assets/categoria-basquetbol.jpg',
      keywords: ['básquetbol', 'basketball', 'cancha', 'domina']
    },
    {
      title: 'Lifestyle',
      subtitle: 'Estilo urbano',
      image: 'assets/categoria-lifestyle.jpg',
      keywords: ['lifestyle', 'estilo', 'urbano', 'casual']
    }
  ];

  filteredCategories: Category[] = [...this.categories];

  featuredProducts: Product[] = [
    { name: 'Zapatillas Nike Air', price: 120, image: 'assets/product1.jpg', description: 'Cómodas y duraderas' },
    { name: 'Botas Adidas', price: 90, image: 'assets/product2.jpg', description: 'Para todo terreno' },
    { name: 'Sandalias Puma', price: 50, image: 'assets/product3.jpg', description: 'Ligeras y frescas' }
  ];

  bestSellers: Product[] = [
    { name: 'Reebok Classic', price: 80, image: 'assets/product4.jpg', description: 'Ventas top' },
    { name: 'New Balance 574', price: 70, image: 'assets/product5.jpg', description: 'Favorito de clientes' },
    { name: 'Nike React', price: 130, image: 'assets/product6.jpg', description: 'Más vendidas' }
  ];

  salesProducts: Product[] = [
    { name: 'Adidas Ultraboost', price: 100, image: 'assets/product7.jpg', description: 'Descuento 20%' },
    { name: 'Puma RS-X', price: 60, image: 'assets/product8.jpg', description: 'Oferta especial' },
    { name: 'Reebok Nano', price: 85, image: 'assets/product9.jpg', description: 'Precio reducido' }
  ];

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.isSearching = term.length > 0;
    
    if (term === '') {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(category => 
        category.title.toLowerCase().includes(term) ||
        category.subtitle.toLowerCase().includes(term) ||
        category.keywords.some(keyword => keyword.includes(term))
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.filteredCategories = [...this.categories];
  }

  // Cuenta las categorías encontradas
  getSearchResultsCount(): number {
    return this.filteredCategories.length;
  }
}