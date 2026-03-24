import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService, AdminUser } from '../../../Services/admin.service';
import { AuthService } from '../../../Services/auth.service';
import { Product, Compra, Categoria } from '../../../models/product.model';

type Tab = 'categorias' | 'productos' | 'compras' | 'usuarios';

interface ProductForm {
  name:           string;
  description:    string;
  price:          number | null;
  original_price: number | null;
  badge:          string;
  sizes:          string;    // comma-separated
  stock:          number | null;
  activo:         boolean;
  categoria_id:   string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  activeTab: Tab = 'categorias';

  // ── Categorías ────────────────────────────────────────────────────────────
  showCatModal   = false;
  editingCat: Categoria | null = null;
  catForm = this.emptyCatForm();
  catFile: File | null = null;
  savingCat  = false;
  catMsg     = '';
  catError   = '';

  readonly SLUGS_VALIDOS = [
    'running','lifestyle','basquetbol','nuevo',
    'hombre','mujer','ninos','ofertas','snkrs'
  ];

  // ── Productos ──────────────────────────────────────────────────────────────
  productos:   Product[]   = [];
  categorias:  Categoria[] = [];
  loadingProds = true;

  showProductModal = false;
  editingProduct: Product | null = null;
  productForm: ProductForm = this.emptyForm();
  selectedFile: File | null = null;
  savingProduct  = false;
  productMsg     = '';
  productError   = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // ── Compras ────────────────────────────────────────────────────────────────
  compras:      Compra[]    = [];
  loadingCompras = true;
  expandedCompra: string | null = null;
  updatingStatus: Record<string, boolean> = {};

  // ── Usuarios ───────────────────────────────────────────────────────────────
  usuarios:     AdminUser[] = [];
  loadingUsers  = true;

  constructor(
    private adminService: AdminService,
    private authService:  AuthService,
    private router:       Router
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadProductos();
    this.loadCompras();
    this.loadUsuarios();
  }

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  setTab(tab: Tab): void { this.activeTab = tab; }

  // ─── Categorías ────────────────────────────────────────────────────────────
  private loadCategorias(): void {
    this.adminService.getCategorias().subscribe(c => this.categorias = c);
  }

  openCreateCatModal(): void {
    this.editingCat = null;
    this.catForm    = this.emptyCatForm();
    this.catFile    = null;
    this.catMsg     = '';
    this.catError   = '';
    this.showCatModal = true;
  }

  openEditCatModal(cat: Categoria): void {
    this.editingCat = cat;
    this.catForm = { slug: cat.slug, name: cat.name, subtitle: cat.subtitle ?? '', orden: cat.orden };
    this.catFile  = null;
    this.catMsg   = '';
    this.catError = '';
    this.showCatModal = true;
  }

  closeCatModal(): void { this.showCatModal = false; }

  onCatFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.catFile = input.files?.[0] ?? null;
  }

  saveCat(): void {
    this.catMsg = '';
    this.catError = '';
    this.savingCat = true;

    const fd = new FormData();
    fd.append('name', this.catForm.name);
    if (!this.editingCat) fd.append('slug', this.catForm.slug);
    if (this.catForm.subtitle) fd.append('subtitle', this.catForm.subtitle);
    if (this.catForm.orden != null) fd.append('orden', String(this.catForm.orden));
    if (this.catFile) fd.append('image', this.catFile);

    const req$ = this.editingCat
      ? this.adminService.updateCategoria(this.editingCat.id, fd)
      : this.adminService.createCategoria(fd);

    req$.subscribe({
      next: () => {
        this.catMsg    = this.editingCat ? 'Categoría actualizada.' : 'Categoría creada.';
        this.savingCat = false;
        this.loadCategorias();
        // refresh dropdown in productos modal too
        setTimeout(() => { this.showCatModal = false; }, 1200);
      },
      error: (err) => {
        this.catError  = err?.error?.message ?? 'Error al guardar categoría.';
        this.savingCat = false;
      }
    });
  }

  deleteCat(cat: Categoria): void {
    if (!confirm(`¿Eliminar categoría "${cat.name}"?`)) return;
    this.adminService.deleteCategoria(cat.id).subscribe({
      next: () => this.loadCategorias(),
      error: () => alert('Error al eliminar categoría.')
    });
  }

  private emptyCatForm() {
    return { slug: '', name: '', subtitle: '', orden: 0 };
  }

  // ─── Productos ─────────────────────────────────────────────────────────────
  private loadProductos(): void {
    this.loadingProds = true;
    this.adminService.getProductos().subscribe({
      next: (data) => { this.productos = data; this.loadingProds = false; },
      error: ()     => { this.loadingProds = false; }
    });
  }

  openCreateModal(): void {
    this.editingProduct = null;
    this.productForm    = this.emptyForm();
    this.selectedFile   = null;
    this.productMsg     = '';
    this.productError   = '';
    this.showProductModal = true;
  }

  openEditModal(p: Product): void {
    this.editingProduct = p;
    this.productForm = {
      name:           p.name,
      description:    p.description,
      price:          p.price,
      original_price: p.original_price ?? null,
      badge:          p.badge ?? '',
      sizes:          p.sizes.join(', '),
      stock:          p.stock,
      activo:         p.activo,
      categoria_id:   p.categorias?.id ?? ''
    };
    this.selectedFile = null;
    this.productMsg   = '';
    this.productError = '';
    this.showProductModal = true;
  }

  closeModal(): void { this.showProductModal = false; }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  saveProduct(): void {
    this.productMsg   = '';
    this.productError = '';
    this.savingProduct = true;

    const fd = new FormData();
    fd.append('name',        this.productForm.name);
    fd.append('description', this.productForm.description);
    fd.append('price',       String(this.productForm.price ?? 0));
    fd.append('stock',       String(this.productForm.stock ?? 0));
    fd.append('activo',      String(this.productForm.activo));
    fd.append('sizes',       JSON.stringify(
      this.productForm.sizes.split(',').map(s => s.trim()).filter(Boolean)
    ));
    if (this.productForm.original_price != null)
      fd.append('original_price', String(this.productForm.original_price));
    if (this.productForm.badge)
      fd.append('badge', this.productForm.badge);
    if (this.productForm.categoria_id)
      fd.append('categoria_id', this.productForm.categoria_id);
    if (this.selectedFile)
      fd.append('image', this.selectedFile);

    const req$ = this.editingProduct
      ? this.adminService.updateProducto(this.editingProduct.id, fd)
      : this.adminService.createProducto(fd);

    req$.subscribe({
      next: () => {
        this.productMsg    = this.editingProduct ? 'Producto actualizado.' : 'Producto creado.';
        this.savingProduct = false;
        this.loadProductos();
        setTimeout(() => { this.showProductModal = false; }, 1200);
      },
      error: (err) => {
        this.productError  = err?.error?.message ?? 'Error al guardar producto.';
        this.savingProduct = false;
      }
    });
  }

  deleteProduct(p: Product): void {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    this.adminService.deleteProducto(p.id).subscribe({
      next: () => this.loadProductos(),
      error: () => alert('Error al eliminar producto.')
    });
  }

  // ─── Compras ───────────────────────────────────────────────────────────────
  private loadCompras(): void {
    this.loadingCompras = true;
    this.adminService.getCompras().subscribe({
      next: (data) => { this.compras = data; this.loadingCompras = false; },
      error: ()     => { this.loadingCompras = false; }
    });
  }

  toggleCompra(id: string): void {
    this.expandedCompra = this.expandedCompra === id ? null : id;
  }

  updateStatus(compra: Compra, status: string): void {
    this.updatingStatus[compra.id] = true;
    this.adminService.updateCompraStatus(compra.id, status).subscribe({
      next: (updated) => {
        compra.status = updated.status;
        this.updatingStatus[compra.id] = false;
      },
      error: () => { this.updatingStatus[compra.id] = false; }
    });
  }

  // ─── Usuarios ──────────────────────────────────────────────────────────────
  private loadUsuarios(): void {
    this.loadingUsers = true;
    this.adminService.getUsuarios().subscribe({
      next: (data) => { this.usuarios = data; this.loadingUsers = false; },
      error: ()     => { this.loadingUsers = false; }
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  private emptyForm(): ProductForm {
    return {
      name:           '',
      description:    '',
      price:          null,
      original_price: null,
      badge:          '',
      sizes:          '',
      stock:          0,
      activo:         true,
      categoria_id:   ''
    };
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  statusOptions = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      pendiente: 'Pendiente', procesando: 'Procesando',
      enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado'
    };
    return m[s] ?? s;
  }
}
