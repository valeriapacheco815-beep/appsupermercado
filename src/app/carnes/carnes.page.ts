import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonList, IonItem, IonThumbnail, IonLabel, IonSearchbar
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carnes',
  templateUrl: './carnes.page.html',
  styleUrls: ['./carnes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonList, IonItem, IonThumbnail, IonLabel, IonSearchbar
  ],
})
export class CarnesPage implements OnInit {
  query = '';

  // 👉 Tu lista ORIGINAL (misma vista, mismos campos)
  productos = [
    { nombre: 'Carne de Res Molida 1lb', descripcion: 'Fresca y lista para hamburguesas o guisos.', precio: 'Lps. 85',  imagen: 'assets/Carnes.jpg' },
    { nombre: 'Bistec de Res 1lb',        descripcion: 'Cortes tiernos para freír o asar.',         precio: 'Lps. 110', imagen: 'https://tacisa.com/wp-content/uploads/2016/10/bistec-culata-espalda-ternera-1aB-BG1092.jpg' },
    { nombre: 'Costilla de Res 1lb',      descripcion: 'Perfecta para sopas y parrilladas.',        precio: 'Lps. 95',  imagen: 'https://super-del-corral.myshopify.com/cdn/shop/products/2001015000000_4087x.jpg?v=1589040161' },
    { nombre: 'Pollo Entero 1kg',         descripcion: 'Económico, ideal para comidas familiares.',  precio: 'Lps. 70',  imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcFXAG_w9S684VBA-QOTLYewiujSewgbUPxw&s' },
    { nombre: 'Pechuga de Pollo 1lb',     descripcion: 'Jugosa y sin hueso, lista para cocinar.',    precio: 'Lps. 75',  imagen: 'https://www.gastronomiaycia.com/wp-content/uploads/2017/06/pechugas_madera.jpg' },
    { nombre: 'Piernas de Pollo 1lb',     descripcion: 'Sabor tradicional, ideal para guisos y frituras.', precio: 'Lps. 65', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgcPS70bFWcQW8nt6RINAFBeiVLKh5Xfmxnw&s' },
    { nombre: 'Chuleta de Cerdo 1lb',     descripcion: 'Fresca, jugosa y lista para la plancha.',    precio: 'Lps. 90',  imagen: 'https://okdiario.com/img/recetas/2017/07/25/chuletas-de-cerdo-4.jpg' },
    { nombre: 'Costilla de Cerdo 1lb',    descripcion: 'Ideal para barbacoas y asados.',             precio: 'Lps. 95',  imagen: 'https://minervafoods.com/wp-content/uploads/2022/12/costela_de_porco_inteira-1.jpg' },
    { nombre: 'Longaniza Artesanal 1lb',  descripcion: 'Hecha con receta casera y especias naturales.', precio: 'Lps. 80', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQmonyKvc6fqXqj2qC0GC2qVTB4VxKhLHFxg&s' },
    { nombre: 'Filete de Pescado 1lb',    descripcion: 'Fresco y sin espinas, perfecto para empanizar o asar.', precio: 'Lps. 100', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUPoeJvjbfs4F8aXYfa_LRqmqsdbxt5gwBpA&s' }
  ];

  // Lo que se muestra (misma vista)
  filtered: any[] = [];

  // 👉 Tu API (cambia localhost por la IP de tu PC si pruebas en teléfono)
  private readonly API = 'http://localhost:3000/api/carnes';

  ngOnInit() {
    // Vista original al entrar
    this.filtered = [...this.productos];
  }

  // === BÚSQUEDA SOLO CON BD ===
  async onSearch(ev?: any) {
    const val = String(ev?.target?.value ?? this.query ?? '').trim();

    // Sin texto => restaurar vista original (no BD)
    if (!val) {
      this.filtered = [...this.productos];
      return;
    }

    try {
      // Consultar a la BD
      const res = await fetch(`${this.API}/buscar?q=${encodeURIComponent(val)}`, {
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
      const rows: Array<{ id?: number; nombre: string }> = await res.json();

      // Tomamos SOLO lo que esté en la BD y lo mostramos con tu vista original:
      // filtramos tus productos locales por coincidencia con los nombres devueltos por la BD.
      const dbNames = rows.map(r => this.norm(r.nombre));
      this.filtered = this.productos.filter(p => {
        const lp = this.norm(p.nombre);
        return dbNames.some(n => lp.includes(n) || n.includes(lp));
      });

      // Si la BD devolvió algo que no existe en tu lista local, no lo mostramos
      // (para mantener la vista original con imagen/descr./precio).
    } catch (e) {
      console.error('Error buscando en BD:', e);
      // Si falla la BD durante la búsqueda, no mostramos nada (no local)
      this.filtered = [];
    }
  }

  private norm(s: string) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  trackByNombre(_: number, p: any) {
    return p.id ?? p.nombre;
  }
}
