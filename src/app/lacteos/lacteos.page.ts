import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngFor
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonSearchbar
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type Producto = {
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string;
};

@Component({
  selector: 'app-lacteos',
  templateUrl: './lacteos.page.html',
  styleUrls: ['./lacteos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,          // <-- necesario para [(ngModel)]
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonSearchbar,
    //RouterLink
  ],
})
export class LacteosPage implements OnInit {
  // 🔎 texto de búsqueda
  query = '';

  // 👉 Ajusta si tu backend corre en otra IP/puerto
  private readonly API = 'http://localhost:3000/api/lacteos';

  // Tu arreglo ORIGINAL (la vista usa SIEMPRE esta propiedad)
  productos: Producto[] = [
    { nombre: 'Leche Entera Pasteurizada 1L', descripcion: 'Leche fresca y nutritiva, ideal para consumo diario.', precio: 'Lps. 28', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPNiA6tuYOUOwQZn5bL0HgNHW73Up_ch29Wg&s' },
    { nombre: 'Leche Deslactosada 1L', descripcion: 'Especial para personas intolerantes a la lactosa.', precio: 'Lps. 32', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwzH5i95-tJp-c5dPDgJyYbDlytejSVXeoCg&s' },
    { nombre: 'Yogurt Natural 500ml', descripcion: 'Cremoso y ligero, perfecto para desayunos y meriendas.', precio: 'Lps. 40', imagen: 'https://walmarthn.vtexassets.com/arquivos/ids/671550/10431_02.jpg?v=638859570549500000' },
    { nombre: 'Yogurt con Frutas 1L', descripcion: 'Mezcla de yogurt natural con trozos de fruta.', precio: 'Lps. 55', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa-aMS-ASz-6admn9NLmJIRjLssvX8lzuEYw&s' },
    { nombre: 'Queso Fresco 500g', descripcion: 'Suave, artesanal, ideal para pupusas y comidas caseras.', precio: 'Lps. 65', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbPhaMJYebmi-NpInwWwJMjuaxRbQdZ09iAA&s' },
    { nombre: 'Queso Seco 500g', descripcion: 'Textura firme, perfecto para rallar en comidas.', precio: 'Lps. 75', imagen: 'https://www.buenprovecho.hn/wp-content/uploads/2023/08/queso-seco-1.png' },
    { nombre: 'Mantequilla 400g', descripcion: 'Cremosa, con sabor casero.', precio: 'Lps. 38', imagen: 'https://sula.hn/wp-content/uploads/2020/04/0012_productos-sula-mantequilla-amarilla-400g.jpg' },
    { nombre: 'Quesillo 500g', descripcion: 'Suave y elástico, excelente para tacos y pupusas.', precio: 'Lps. 70', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLCPzwwc1V4FNbsIl0J-f9Oam79xnojLeBIA&s' },
    { nombre: 'Crema 500ml', descripcion: 'Fresca y espesa, perfecta para acompañar platillos típicos.', precio: 'Lps. 45', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD9D-GeuNw2D_Y6Wy61fl-p9P1lIXSWv6YlA&s' },
    { nombre: 'Leche en Polvo 1kg', descripcion: 'Ideal para preparar bebidas y postres.', precio: 'Lps. 120', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7iKgqP-lLRQMFvnrp_M0AfDRT4bnMrtZboA&s' }
  ];

  // Copia del arreglo original para restaurar la vista al limpiar la búsqueda
  private baseLocal: Producto[] = [];

  constructor() {}

  ngOnInit() {
    // Vista original al entrar
    this.baseLocal = [...this.productos];
  }

  // === BÚSQUEDA SOLO CON BD ===
  async onSearch(ev?: any) {
    const val = String(ev?.target?.value ?? this.query ?? '').trim();

    // Sin texto => restaurar vista original (no consultar BD)
    if (!val) {
      this.productos = [...this.baseLocal];
      return;
    }

    try {
      // Consultamos la BD
      const res = await fetch(`${this.API}/buscar?q=${encodeURIComponent(val)}`, {
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);

      // La BD devuelve al menos {id, nombre}. Tomamos esos nombres
      const rows: Array<{ id?: number; nombre: string }> = await res.json();
      const nombresBD = rows.map(r => this.norm(r.nombre));

      // Mostramos en tu vista SOLO los que existan en la BD,
      // usando tus datos locales para mantener imagen/descr./precio.
      this.productos = this.baseLocal.filter(p => {
        const lp = this.norm(p.nombre);
        return nombresBD.some(n => lp.includes(n) || n.includes(lp));
      });
    } catch (e) {
      console.error('Error /api/lacteos/buscar:', e);
      // Si falla la BD durante la búsqueda, no mostramos nada (cumple "solo lo de la BD")
      this.productos = [];
    }
  }

  private norm(s: string) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
