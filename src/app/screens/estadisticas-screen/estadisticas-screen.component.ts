
import { EstadisticasService, PersonajeStats } from '../../services/estadisticas.service';
import { ChartConfiguration, Plugin } from 'chart.js';
import { Component, OnInit, AfterViewInit, HostListener, ViewChildren, QueryList } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { KiParser } from '../../utils/ki-parser.util';

type PersonajeRow = PersonajeStats & { imagen_src?: string; imagen?: string };

@Component({
    selector: 'app-estadisticas-screen',
    templateUrl: './estadisticas-screen.component.html',
    styleUrls: ['./estadisticas-screen.component.scss'],
    standalone: false
})
export class EstadisticasScreenComponent implements OnInit {

  
  isLoading = true;

  // agrupación por afiliación
  estadisticas: Record<string, PersonajeStats[]> = {};
  afiliaciones: string[] = [];

  // datos/options por afiliación
  chartData: Record<string, ChartConfiguration<'bar'>['data']> = {};
  chartOptionsByAf: Record<string, NonNullable<ChartConfiguration<'bar'>['options']>> = {};

  chartHeight = 420;
  private placeholder = 'assets/placeholder-dbz.png';

  private nf = new Intl.NumberFormat('es-MX');
  private nfCompact = new Intl.NumberFormat('es-MX', { notation: 'compact' });

  constructor(private statsService: EstadisticasService) {}

  ngOnInit(): void {
    this.statsService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.afiliaciones = Object.keys(data);

        // Colores idénticos al componente de API
        const totalOrange   = this.tryRgba('--dbz-orange-500-rgb', 0.82, 'rgba(245,158,11,0.82)');
        const totalOrangeBd = this.tryRgba('--dbz-orange-500-rgb', 1,    'rgba(245,158,11,1)');

        for (const af of this.afiliaciones) {
          const personajes = (data[af] ?? []) as PersonajeRow[];
          
          // Filtrar personajes excluidos (Zeno, Gogeta, Vegetto, Broly)
          const personajesFiltrados = personajes.filter(p => {
            const nombreLower = p.nombre.toLowerCase();
            return !nombreLower.includes('zeno') && 
                   !nombreLower.includes('gogeta') && 
                   !nombreLower.includes('vegetto') &&
                   !nombreLower.includes('broly');
          });

          const labels = personajesFiltrados.map(p => this.truncate(p.nombre, 14));
          const imgs   = personajesFiltrados.map(p => p.imagen_src || p.imagen || this.placeholder);

          // BASE KI (alineado al diseño API)
          const d: ChartConfiguration<'bar'>['data'] = {
            labels,
            datasets: [
              {
                label: 'Base KI',
                data: personajesFiltrados.map(p => Number(p.base_ki) || 0),
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

          // guarda imágenes para el plugin (fallback exacto)
          (d as any)._tickImages = imgs;

          this.chartData[af] = d;

          // opciones base + plugin con mismas fuentes/colores
          const baseOpts   = this.buildBaseOptions();
          const mutedColor = this.cssVar('--dbz-muted') || '#64748b';

          this.chartOptionsByAf[af] = {
            ...baseOpts,
            plugins: {
              ...(baseOpts.plugins || {}),
              legend: { display: false },
              ...( {
                imageTicks: {
                  images: imgs,
                  labels,
                  size: 30,
                  yOffset: 30,
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
        console.error('Error al obtener estadísticas:', err);
        this.isLoading = false;
      }
    });
  }

  /** Plugin: oculta etiquetas nativas y dibuja NOMBRE (encima) + IMAGEN circular (debajo) como en API */
  imageTickPlugin: Plugin<'bar'> = {
    id: 'imageTicks',
    afterDraw: (chart, _args, opts: any) => {
      const { ctx, chartArea, scales } = chart;
      const xScale: any = (scales as any).x;
      if (!xScale) return;

      // arrays a usar (options → fallback en data._tickImages)
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
        // fondo blanco para contraste (igual que en API)
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

  /** Opciones base alineadas al componente API */
 private buildBaseOptions(): NonNullable<ChartConfiguration<'bar'>['options']> {
  const textColor  = this.cssVar('--dbz-text')  || '#1f2937';
  const mutedColor = this.cssVar('--dbz-muted') || '#64748b';
  const gridColor  = this.cssVar('--dbz-grid')  || 'rgba(0,0,0,.06)';

  // tamaño del avatar (30) + separación (30) + margen seguridad (20) ≈ 80–90
  // usamos 110 para asegurar que nunca se corte en distintos DPI
  const bottomPadding = 110;

  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8, right: 12, bottom: bottomPadding, left: 4 } }, // espacio para NOMBRE + IMG
      scales: {
        x: {
          ticks: {
            display: false,
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
            callback: (v) => KiParser.format(Number(v))
          },
          grid: { color: gridColor },
          border: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(17,24,39,.95)',
          titleColor: textColor,
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(148,163,184,.25)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (ctx) => `Base KI: ${KiParser.format(ctx.parsed.y ?? 0)}`
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

  private truncate(text: string, max = 14): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
  }
}
