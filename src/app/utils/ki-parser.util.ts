/**
 * Utilidad para parsear valores de KI que vienen en diferentes formatos:
 * - Números simples: 0, 450000
 * - Números con separadores: "450.000", "195.000.000"
 * - Notación con palabras en inglés: "102 Billion", "7 quadrillion", "11.2 Septillion"
 */

export class KiParser {
  
  private static readonly MULTIPLIERS: Record<string, number> = {
    'thousand': 1e3,
    'million': 1e6,
    'billion': 1e9,
    'trillion': 1e12,
    'quadrillion': 1e15,
    'quintillion': 1e18,
    'sextillion': 1e21,
    'septillion': 1e24,
    'octillion': 1e27,
    'nonillion': 1e30,
    'decillion': 1e33,
    // Abreviaciones comunes
    'k': 1e3,
    'm': 1e6,
    'b': 1e9,
    't': 1e12
  };

  /**
   * Convierte cualquier formato de KI a número
   * @param val Valor de KI en cualquier formato
   * @returns Número parseado o 0 si no se puede parsear
   */
  static parse(val: string | number | null | undefined): number {
    // Casos simples
    if (val == null || val === '') return 0;
    if (typeof val === 'number') return val;
    
    // Convertir a string y normalizar
    const str = String(val).toLowerCase().trim();
    
    // Si es un número simple (sin letras), limpiar y parsear
    if (!/[a-z]/i.test(str)) {
      // Eliminar puntos (separadores de miles) y comas, dejar solo números y punto decimal
      const cleaned = str.replace(/\./g, '').replace(/,/g, '.');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    
    // Tiene letras, buscar multiplicador
    // Formato típico: "102 billion" o "7quadrillion" o "11.2 Septillion"
    const parts = str.match(/^([\d.,]+)\s*([a-z]+)$/i);
    
    if (!parts) {
      // No coincide con el patrón esperado, intentar parsear solo el número
      const numPart = str.match(/[\d.,]+/);
      if (numPart) {
        const cleaned = numPart[0].replace(/\./g, '').replace(/,/g, '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    }
    
    // Extraer número base y multiplicador
    const numStr = parts[1].replace(/\./g, '').replace(/,/g, '.');
    const multiplierStr = parts[2];
    
    const baseNum = parseFloat(numStr);
    if (isNaN(baseNum)) return 0;
    
    // Buscar multiplicador
    const multiplier = this.MULTIPLIERS[multiplierStr] || 1;
    
    return baseNum * multiplier;
  }

  /**
   * Formatea un número grande de forma compacta (ej: 1.5M, 2.3B)
   * @param num Número a formatear
   * @returns String formateado
   */
  static format(num: number): string {
    if (num === 0) return '0';
    
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    
    if (absNum >= 1e24) {
      return sign + (absNum / 1e24).toFixed(1) + ' Septillion';
    }
    if (absNum >= 1e21) {
      return sign + (absNum / 1e21).toFixed(1) + ' Sextillion';
    }
    if (absNum >= 1e18) {
      return sign + (absNum / 1e18).toFixed(1) + ' Quintillion';
    }
    if (absNum >= 1e15) {
      return sign + (absNum / 1e15).toFixed(1) + ' Quadrillion';
    }
    if (absNum >= 1e12) {
      return sign + (absNum / 1e12).toFixed(1) + ' Trillion';
    }
    if (absNum >= 1e9) {
      return sign + (absNum / 1e9).toFixed(1) + ' Billion';
    }
    if (absNum >= 1e6) {
      return sign + (absNum / 1e6).toFixed(1) + ' Million';
    }
    if (absNum >= 1e3) {
      return sign + (absNum / 1e3).toFixed(1) + 'K';
    }
    
    return sign + absNum.toLocaleString('es-MX');
  }
}
