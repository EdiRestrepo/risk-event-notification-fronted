/**
 * Índice de exportaciones del módulo Decorator
 * Facilita los imports al importar desde la carpeta en lugar de archivos individuales
 *
 * Uso:
 * import { AlertMessage, BaseAlertMessage, AlertMessageBuilderService } from './services/decorator';
 */

export type { AlertMessage } from './alert-message.interface';
export { BaseAlertMessage } from './base-alert-message';
export { AlertMessageDecorator } from './alert-message.decorator';
export { RiskLevelAlertDecorator } from './risk-level-alert.decorator';
export { LocationAlertDecorator } from './location-alert.decorator';
export { SafetyRecommendationAlertDecorator } from './safety-recommendation-alert.decorator';
export { PriorityAlertDecorator } from './priority-alert.decorator';
export { TimestampAlertDecorator } from './timestamp-alert.decorator';
export { PlainLanguageAlertDecorator } from './plain-language-alert.decorator';
export { AlertMessageBuilderService, AlertMessageFluentBuilder } from './alert-message-builder.service';
