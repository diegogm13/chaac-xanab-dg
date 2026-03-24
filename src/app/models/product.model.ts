// Interfaces compartidas del catálogo
// Movidas desde app.component.ts para que estén disponibles en toda la app

export interface Categoria {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  image_url?: string;
  orden: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  description: string;
  sizes: string[];
  badge?: string;
  stock: number;
  activo: boolean;
  categorias?: { id: string; slug: string; name: string };
}

export interface CompraItem {
  producto_id: string;
  size: string;
  quantity: number;
}

export interface Compra {
  id: string;
  total: number;
  status: string;
  created_at: string;
  compras_items: {
    id: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
    image_url: string;
  }[];
}

export interface DireccionUsuario {
  id?: string;
  calle: string;
  numero_ext: string;
  numero_int?: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  pais?: string;
}
