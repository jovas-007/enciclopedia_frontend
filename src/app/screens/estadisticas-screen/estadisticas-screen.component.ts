import { Component, OnInit } from '@angular/core';
import { EstadisticasService, PersonajeStats } from '../../services/estadisticas.service';
import { ChartConfiguration, Plugin } from 'chart.js';

type PersonajeRow = PersonajeStats & { imagen_src?: string; imagen?: string };

@Component({
  selector: 'app-estadisticas-screen',
  templateUrl: './estadisticas-screen.component.html',
  styleUrls: ['./estadisticas-screen.component.scss']
})
export class EstadisticasScreenComponent implements OnInit {

  isLoading = true;

  estadisticas: Record<string, PersonajeStats[]> = {};
  afiliaciones: string[] = [];

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

        // Colores (fallback si no existen las CSS vars)
        const baseBlue      = this.tryRgba('--dbz-blue-500-rgb', 0.85, 'rgba(59,130,246,0.85)');
        const baseBlueBord  = this.tryRgba('--dbz-blue-500-rgb', 1,    'rgba(59,130,246,1)');
        const totalOrange   = this.tryRgba('--dbz-orange-500-rgb', 0.82,'rgba(245,158,11,0.82)');
        const totalOrangeBd = this.tryRgba('--dbz-orange-500-rgb', 1,   'rgba(245,158,11,1)');

        for (const af of this.afiliaciones) {
          const personajes = (data[af] ?? []) as PersonajeRow[];

          const labels = personajes.map(p => p.nombre);
          const imgs   = personajes.map(p => p.imagen_src || p.imagen || this.placeholder);

          const d: ChartConfiguration<'bar'>['data'] = {
            labels,
            datasets: [
              {
                label: 'Base KI',
                data: personajes.map(p => p.base_ki),
                backgroundColor: baseBlue,
                borderColor: baseBlueBord,
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 42,
                maxBarThickness: 48,
                categoryPercentage: 0.78,
                barPercentage: 0.72
              },
              {
                label: 'Total KI',
                data: personajes.map(p => p.total_ki),
                backgroundColor: totalOrange,
                borderColor: totalOrangeBd,
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 42,
                maxBarThickness: 48,
                categoryPercentage: 0.78,
                barPercentage: 0.72
              }
            ]
          };

          // Respaldo: guardo las imágenes dentro del data para que el plugin
          // las encuentre aunque no lleguen via options.plugins.imageTicks
          (d as any)._tickImages = imgs;

          this.chartData[af] = d;

          // Opciones base + opciones del plugin (con any para no chocar con tipos)
          const baseOpts = this.buildBaseOptions();
          this.chartOptionsByAf[af] = {
            ...baseOpts,
            plugins: {
              ...(baseOpts.plugins ?? {}),
              ...( { imageTicks: { images: imgs, size: 28, yOffset: 24 } } as any )
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

  /** Plugin: dibuja miniaturas debajo de cada tick del eje X */
  imageTickPlugin: Plugin<'bar'> = {
    id: 'imageTicks',
    afterDraw: (chart, _args, opts: any) => {
      // 1) Primero intento leer desde options.plugins.imageTicks.images
      let imgUrls: string[] | undefined = opts?.images;
      // 2) Respaldo: si no viene, las tomo de chart.data._tickImages
      if (!imgUrls || !imgUrls.length) {
        imgUrls = (chart.data as any)?._tickImages as string[] | undefined;
      }
      if (!imgUrls || !imgUrls.length) return;

      const { ctx, chartArea, scales } = chart;
      const xScale: any = (scales as any).x;
      if (!xScale) return;

      const size = opts?.size ?? 28;
      const half = size / 2;
      const y = chartArea.bottom + (opts?.yOffset ?? 20);

      (opts._cache ||= []);

      xScale.ticks.forEach((_t: any, i: number) => {
        const x = xScale.getPixelForTick(i);
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
        ctx.beginPath();
        ctx.arc(x, y, half, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - half, y - half, size, size);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(x, y, half, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  };

  /** Opciones base (no nulas) */
  private buildBaseOptions(): NonNullable<ChartConfiguration<'bar'>['options']> {
    const text  = this.cssVar('--dbz-text')  || '#e5e7eb';
    const muted = this.cssVar('--dbz-muted') || '#94a3b8';
    const grid  = this.cssVar('--dbz-grid')  || 'rgba(255,255,255,.08)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 8, right: 12, bottom: 52, left: 4 } },
      scales: {
        x: {
          ticks: {
            color: muted,
            padding: 14,
            font: { size: 12, weight: '600', family: 'Inter, Roboto, "Helvetica Neue", Arial' }
          },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          ticks: {
            color: muted,
            font: { size: 12, family: 'Inter, Roboto, "Helvetica Neue", Arial' },
            callback: (v) => this.nfCompact.format(Number(v))
          },
          grid: { color: grid },
          border: { display: false }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: text,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 10,
            padding: 16,
            font: { size: 13, weight: '700', family: 'Inter, Roboto, "Helvetica Neue", Arial' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17,24,39,.95)',
          titleColor: '#e5e7eb',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(148,163,184,.25)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (ctx) => `${this.nf.format(ctx.parsed.y)} (${ctx.dataset.label})`
          }
        }
      },
      animation: { duration: 350, easing: 'easeOutQuart' }
    };
  }

  // ===== helpers =====
  private cssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  private tryRgba(rgbVar: string, a: number, fallback: string): string {
    const v = this.cssVar(rgbVar);
    return v ? `rgba(${v}, ${a})` : fallback;
  }
}
