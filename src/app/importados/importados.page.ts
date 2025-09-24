import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonList, IonItem, IonThumbnail, IonLabel, IonSearchbar
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type Producto = { nombre: string; descripcion: string; precio: string; imagen: string; };

@Component({
  selector: 'app-importados',
  templateUrl: './importados.page.html',
  styleUrls: ['./importados.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,        // para [(ngModel)]
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonList, IonItem, IonThumbnail, IonLabel, IonSearchbar,
    //RouterLink
  ],
})
export class ImportadosPage implements OnInit {
  query = '';
  private readonly API = 'http://localhost:3000/api/importados';

  // Tu lista ORIGINAL (mantiene la vista con imagen/descr./precio)
  productos: Producto[] = [
    { nombre: 'Aceite de Oliva Extra Virgen 500ml (España)', descripcion: 'Puro y aromático, ideal para ensaladas.', precio: 'Lps. 145', imagen: 'https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00841066007460L.jpg' },
    { nombre: 'Pasta Italiana Spaghetti 500g (Italia)', descripcion: 'Tradicional, de cocción al dente.', precio: 'Lps. 65', imagen: 'https://m.media-amazon.com/images/I/71KivvbEzKL._UF894,1000_QL80_.jpg' },
    { nombre: 'Salsa de Soya 1L (Japón)', descripcion: 'Sabor auténtico para marinar y cocinar.', precio: 'Lps. 120', imagen: 'https://www.cocinista.es/download/bancorecursos/productos4/10606a-salsa-soja-daisho-1l.jpg' },
    { nombre: 'Queso Mozzarella 500g (Italia)', descripcion: 'Suave y perfecto para pizzas.', precio: 'Lps. 160', imagen: 'https://www.vamosacomer.eu/wp-content/uploads/2025/02/Lo-que-necesitas-saber-sobre-la-Mozzarella-italiana.jpg' },
    { nombre: 'Café Colombiano 250g (Colombia)', descripcion: 'Aroma intenso y sabor único.', precio: 'Lps. 135', imagen: 'https://resources.claroshop.com/medios-plazavip/t1/1715658199CafeLiofilisado1jpg' },
    { nombre: 'Chocolate Suizo 100g (Suiza)', descripcion: 'Cremoso y de alta calidad.', precio: 'Lps. 90', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhq7JDhnVSrRrSCmXr_V8ui3r6htad8j5VLA&s' },
    { nombre: 'Vino Tinto 750ml (Chile)', descripcion: 'Suave y frutal, excelente para acompañar carnes.', precio: 'Lps. 280', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVE9A-6MfGkkf5w5BYEplYzIn2uSdpJPXttw&s' },
    { nombre: 'Atún en Aceite 170g (Ecuador)', descripcion: 'Conserva de pescado premium.', precio: 'Lps. 60', imagen: 'https://www.supermercadosantamaria.com/documents/10180/10504/140753080_G.jpg' },
    { nombre: 'Miel de Maple 250ml (Canadá)', descripcion: 'Dulce natural, perfecto para pancakes.', precio: 'Lps. 150', imagen: 'https://dcdn-us.mitiendanube.com/stores/495/644/products/maple-syrup-jarabe-de-maple-de-canada-x-250-cc-d_nq_np_723901-mla31353019871_072019-f1-20d2ac0889f5e79e5d15868152095995-640-0.jpg' },
    { nombre: 'Galletas Danesas de Mantequilla 454g (Dinamarca)', descripcion: 'Clásicas y crujientes.', precio: 'Lps. 180', imagen: 'https://okdiario.com/img/recetas/2016/11/22/galletas-danesas.jpg' }
  ];

  private baseLocal: Producto[] = [];

  ngOnInit() {
    // Vista original al entrar
    this.baseLocal = [...this.productos];
  }

  // 🔎 Buscar SOLO según la BD
  async onSearch(ev?: any) {
    const val = String(ev?.target?.value ?? this.query ?? '').trim();

    // Sin texto: restaurar lista original
    if (!val) {
      this.productos = [...this.baseLocal];
      return;
    }

    try {
      const res = await fetch(`${this.API}/buscar?q=${encodeURIComponent(val)}`, {
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);

      // La BD devuelve al menos {id, nombre}. Tomamos esos nombres
      const rows: Array<{ id?: number; nombre: string }> = await res.json();
      const nombresBD = rows.map(r => this.norm(r.nombre));

      // Mostramos SOLO los que existan en la BD, con tu vista original
      this.productos = this.baseLocal.filter(p => {
        const lp = this.norm(p.nombre);
        return nombresBD.some(n => lp.includes(n) || n.includes(lp));
      });
    } catch (e) {
      console.error('Error /api/importados/buscar:', e);
      // Si falla la BD en la búsqueda, no mostramos nada (respeta "solo lo de la BD")
      this.productos = [];
    }
  }

  private norm(s: string) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
