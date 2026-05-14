/**
 * Interfaz AlertMessage
 * Define el contrato para componentes que pueden ser decorados
 * Parte del patrón estructural Decorator
 */
export interface AlertMessage {
  /**
   * Obtiene el título de la alerta
   */
  getTitle(): string;

  /**
   * Obtiene el cuerpo/body del mensaje de la alerta
   */
  getBody(): string;

  /**
   * Obtiene metadatos adicionales de la alerta
   */
  getMetadata(): Record<string, string>;
}
