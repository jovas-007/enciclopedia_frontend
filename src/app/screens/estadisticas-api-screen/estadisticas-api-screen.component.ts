import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, Plugin } from 'chart.js';
import { PersonajesService, Personaje } from '../../services/personajes.service';

@Component({
  selector: 'app-estadisticas-api-screen',
  templateUrl: './estadisticas-api-screen.component.html',
  styleUrls: ['./estadisticas-api-screen.component.scss']
})
export class EstadisticasApiScreenComponent implements OnInit {
  isLoading = true;

  // agrupación por afiliación
  estadisticas: Record<string, Personaje[]> = {};
  afiliaciones: string[] = [];

  // datos/options por afiliación
  chartData: Record<string, ChartConfiguration<'bar'>['data']> = {};
  chartOptionsByAf: Record<string, NonNullable<ChartConfiguration<'bar'>['options']>> = {};

  chartHeight = 420;
  private placeholder = 'assets/placeholder-dbz.png';

  private nf = new Intl.NumberFormat('es-MX');
  private nfCompact = new Intl.NumberFormat('es-MX', { notation: 'compact' });

  constructor(private personajesService: PersonajesService) {}

  ngOnInit(): void {
    // carga masiva desde la API pública
    this.personajesService.obtenerPersonajes(1000).subscribe({
      next: (characters) => {
        // agrupar por afiliación
        const grupos: Record<string, Personaje[]> = {};
        for (const pj of characters) {
          let af = pj.affiliation || 'Sin afiliación';
          if (af.toLowerCase() === 'unknown') af = 'Sin afiliación';
          (grupos[af] ||= []).push(pj);
        }

        this.estadisticas = grupos;
        this.afiliaciones = Object.keys(grupos);

        // colores
        const totalOrange   = this.tryRgba('--dbz-orange-500-rgb', 0.82, 'rgba(245,158,11,0.82)');
        const totalOrangeBd = this.tryRgba('--dbz-orange-500-rgb', 1,    'rgba(245,158,11,1)');

        for (const af of this.afiliaciones) {
          const personajes = grupos[af] || [];
          const labels = personajes.map(p => this.truncate(p.name, 14));
          const imgs   = personajes.map(p => p.image || this.placeholder);

          // SOLO TOTAL KI (máximo)
          const dataValsMax = personajes.map(p => this.parseKi(p.maxKi));

          const d: ChartConfiguration<'bar'>['data'] = {
            labels,
            datasets: [
              {
                label: 'Total KI',
                data: dataValsMax,
                backgroundColor: totalOrange,
                borderColor: totalOrangeBd,
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 46,
                maxBarThickness: 52,
                categoryPercentage: 0.78,
                barPercentage: 0.72
              }
            ]
          };

          // guardo imágenes para el plugin (fallback)
          (d as any)._tickImages = imgs;

          this.chartData[af] = d;

          // opciones base + plugin que dibuja nombre+imagen
          const baseOpts = this.buildBaseOptions();
          const textColor  = this.cssVar('--dbz-text')  || '#1f2937';
          const mutedColor = this.cssVar('--dbz-muted') || '#64748b';

          this.chartOptionsByAf[af] = {
            ...baseOpts,
            plugins: {
              ...(baseOpts.plugins || {}),
              legend: { display: false }, // ocultar leyenda (solo 1 dataset)
              // opciones personalizadas del plugin (extensión vía "as any")
              ...( {
                imageTicks: {
                  images: imgs,
                  labels,                    // el plugin dibuja el texto (arriba) y la imagen (abajo)
                  size: 30,
                  yOffset: 30,               // distancia bajo el eje
                  labelColor: mutedColor,
                  font: '700 11px Inter, Roboto, "Helvetica Neue", Arial'
                }
              } as any )
            } as any
          };
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener personajes de la API:', err);
        this.isLoading = false;
      }
    });
  }

  /** Plugin: oculta etiquetas nativas y dibuja NOMBRE (encima) + IMAGEN circular (debajo) sin solaparse */
  imageTickPlugin: Plugin<'bar'> = {
    id: 'imageTicks',
    afterDraw: (chart, _args, opts: any) => {
      const { ctx, chartArea, scales } = chart;
      const xScale: any = (scales as any).x;
      if (!xScale) return;

      // arrays a usar
      let imgUrls: string[] | undefined = opts?.images;
      if (!imgUrls?.length) imgUrls = (chart.data as any)?._tickImages as string[] | undefined;
      const labels: string[] = opts?.labels || (chart.data.labels as string[]);

      if (!imgUrls?.length) return;

      const size = opts?.size ?? 30;
      const half = size / 2;
      const yImg = chartArea.bottom + (opts?.yOffset ?? 28);
      const labelColor = opts?.labelColor || '#64748b';
      const font = opts?.font || '700 11px Inter, Roboto, "Helvetica Neue", Arial';

      (opts._cache ||= []);

      xScale.ticks.forEach((_tick: any, i: number) => {
        const x = xScale.getPixelForTick(i);

        // === texto (encima de la imagen) ===
        const name = labels?.[i] ?? '';
        if (name) {
          ctx.save();
          ctx.font = font;
          ctx.fillStyle = labelColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(name, x, yImg - half - 6);
          ctx.restore();
        }

        // === imagen (debajo del nombre) ===
        const src = imgUrls![i];
        if (!src) return;

        let img: HTMLImageElement = opts._cache[i];
        if (!img || img.src !== src) {
          img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = src;
          opts._cache[i] = img;
          img.onload = () => chart.draw();
        }
        if (!img.complete) return;

        ctx.save();
        // fondo blanco para contraste
        ctx.beginPath();
        ctx.arc(x, yImg, half, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        // recorte circular y dibujo
        ctx.beginPath();
        ctx.arc(x, yImg, half, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - half, yImg - half, size, size);
        ctx.restore();

        // borde sutil
        ctx.beginPath();
        ctx.arc(x, yImg, half, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  };

  /** Opciones base: sin etiquetas nativas en X para evitar solapes; padding inferior extra */
  private buildBaseOptions(): NonNullable<ChartConfiguration<'bar'>['options']> {
    const textColor  = this.cssVar('--dbz-text')  || '#1f2937';
    const mutedColor = this.cssVar('--dbz-muted') || '#64748b';
    const gridColor  = this.cssVar('--dbz-grid')  || 'rgba(0,0,0,.06)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 8, right: 12, bottom: 86, left: 4 } }, // espacio para NOMBRE + IMG
      scales: {
        x: {
          ticks: {
            display: false,               // ocultar etiquetas nativas → usamos el plugin
            maxRotation: 0,
            minRotation: 0,
          },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          ticks: {
            color: mutedColor,
            font: { size: 12, family: 'Inter, Roboto, "Helvetica Neue", Arial' },
            callback: (v) => this.nfCompact.format(Number(v))
          },
          grid: { color: gridColor },
          border: { display: false }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17,24,39,.95)',
          titleColor: textColor,
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(148,163,184,.25)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (ctx) => `${this.nf.format(ctx.parsed.y)}`
          }
        }
      },
      animation: { duration: 350, easing: 'easeOutQuart' }
    };
  }

  // ===== utilidades =====
  private cssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  private tryRgba(rgbVar: string, alpha: number, fallback: string): string {
    const val = this.cssVar(rgbVar);
    return val ? `rgba(${val}, ${alpha})` : fallback;
  }

  private parseKi(val: string | number | null | undefined): number {
    if (val == null) return 0;
    if (typeof val === 'number') return val;
    const cleaned = val.replace(/[^\d.\-e+]/gi, ''); // deja números y notación científica
    const n = Number(cleaned);
    return isNaN(n) ? 0 : n;
  }

  private truncate(text: string, max = 14): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
  }
}
