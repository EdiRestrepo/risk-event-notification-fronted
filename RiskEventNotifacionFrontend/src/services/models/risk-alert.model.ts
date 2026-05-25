/**
 * Modelo de dominio para las alertas recibidas desde el backend.
 *
 * La estructura base corresponde al contrato acordado con el backend:
 * {
 *   title: string,
 *   content: { ...datos de la alerta... }
 * }
 */
export type AlertStatus = 'Active' | 'Expired' | 'Resolved' | 'Cancelled' | string;

export interface BackendRiskAlertContent {
  id: string;
  eventType: number;
  riskLevel: number;
  title: string;
  message: string;
  location: string;
  source: string;
  createdAt: string;
  expiresAt: string;
  status: AlertStatus;
  instructions: string[];
  channels: number[];
}

export interface BackendRiskAlertNotification {
  title: string;
  content: BackendRiskAlertContent;
}

/**
 * Alerta manejada por el frontend.
 * Conserva la misma estructura del backend y agrega solo metadatos de UI.
 */
export interface RealTimeAlert extends BackendRiskAlertNotification {
  receivedAt: Date;
  simulated: boolean;
}

export const ALERT_SIMULATION_INTERVAL_MILLISECONDS = 20000;
export const ALERT_AUTO_CLOSE_MILLISECONDS = 5000;
export const ALERT_CRITICAL_AUTO_CLOSE_MILLISECONDS = 40000;

/**
 * Codigos esperados desde backend para canales de notificacion.
 * Estos codigos se adaptan a los nombres usados por Factory Method.
 */
export enum BackendNotificationChannelCode {
  Sms = 1,
  Email = 2,
  Push = 3,
  WhatsApp = 4
}
