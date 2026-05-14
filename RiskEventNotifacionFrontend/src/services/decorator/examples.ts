/**
 * Ejemplo completo de uso del patrón Decorator
 * Este archivo muestra diferentes formas de usar los decoradores
 *
 * NO ES PARTE DEL CÓDIGO PRODUCTIVO
 * Solo es un archivo de referencia para entender cómo usar el patrón
 */

import { AlertMessage } from './alert-message.interface';
import { BaseAlertMessage } from './base-alert-message';
import { RiskLevelAlertDecorator } from './risk-level-alert.decorator';
import { LocationAlertDecorator } from './location-alert.decorator';
import { SafetyRecommendationAlertDecorator } from './safety-recommendation-alert.decorator';
import { PriorityAlertDecorator } from './priority-alert.decorator';
import { TimestampAlertDecorator } from './timestamp-alert.decorator';
import { PlainLanguageAlertDecorator } from './plain-language-alert.decorator';
import { AlertMessageBuilderService } from './alert-message-builder.service';

/**
 * EJEMPLO 1: Construcción Manual paso a paso
 * Demuestra la composición de decoradores de forma explícita
 */
export function example1_ManualConstruction() {
  console.group('EJEMPLO 1: Construcción Manual');

  // 1. Crear mensaje base
  let message: AlertMessage = new BaseAlertMessage(
    'Lluvias intensas',
    'Se prevén lluvias intensas durante las próximas horas en el Valle de Aburrá.'
  );

  console.log('Paso 1 - Mensaje base:');
  console.log('  Título:', message.getTitle());
  console.log('  Cuerpo:', message.getBody());
  console.log('  Metadata:', message.getMetadata());

  // 2. Agregar nivel de riesgo
  message = new RiskLevelAlertDecorator(message, 'NARANJA');
  console.log('\nPaso 2 - Con RiskLevelDecorator:');
  console.log('  Título:', message.getTitle());

  // 3. Agregar ubicación
  message = new LocationAlertDecorator(message, ['Medellín', 'Bello', 'Envigado']);
  console.log('\nPaso 3 - Con LocationDecorator:');
  console.log('  Cuerpo:', message.getBody());

  // 4. Agregar recomendación
  message = new SafetyRecommendationAlertDecorator(
    message,
    'Evite transitar cerca de quebradas y zonas de ladera.'
  );
  console.log('\nPaso 4 - Con SafetyRecommendationDecorator:');
  console.log('  Cuerpo:', message.getBody());

  // 5. Agregar prioridad
  message = new PriorityAlertDecorator(message, 'Alta');
  console.log('\nPaso 5 - Con PriorityDecorator:');
  console.log('  Cuerpo:', message.getBody());

  // 6. Agregar timestamp
  message = new TimestampAlertDecorator(message, new Date());
  console.log('\nPaso 6 - Con TimestampDecorator:');
  console.log('  Cuerpo:', message.getBody());

  // 7. Agregar lenguaje claro
  message = new PlainLanguageAlertDecorator(message);
  console.log('\nPaso 7 - Con PlainLanguageDecorator:');
  console.log('  Cuerpo:', message.getBody());

  console.log('\nMensaje Final Completo:');
  console.log('════════════════════════════════════════════');
  console.log('TÍTULO:', message.getTitle());
  console.log('CUERPO:', message.getBody());
  console.log('METADATA:', message.getMetadata());
  console.log('════════════════════════════════════════════');

  console.groupEnd();
}

/**
 * EJEMPLO 2: Decoradores en orden diferente
 * Demuestra que el orden puede variar según la necesidad
 */
export function example2_DifferentOrder() {
  console.group('EJEMPLO 2: Orden Diferente de Decoradores');

  // El orden de los decoradores puede importar según el efecto deseado
  let message1: AlertMessage = new BaseAlertMessage(
    'Inundación',
    'Riesgo de inundación detectado.'
  );

  // Opción A: Timestamp primero, luego prioridad
  message1 = new TimestampAlertDecorator(message1, new Date());
  message1 = new PriorityAlertDecorator(message1, 'Alta');

  console.log('Opción A (Timestamp → Prioridad):');
  console.log(message1.getBody());

  // Opción B: Prioridad primero, luego timestamp
  let message2: AlertMessage = new BaseAlertMessage(
    'Inundación',
    'Riesgo de inundación detectado.'
  );

  message2 = new PriorityAlertDecorator(message2, 'Alta');
  message2 = new TimestampAlertDecorator(message2, new Date());

  console.log('\nOpción B (Prioridad → Timestamp):');
  console.log(message2.getBody());

  console.groupEnd();
}

/**
 * EJEMPLO 3: Decoradores selectivos
 * Demuestra que no todos los decoradores deben usarse
 */
export function example3_SelectiveDecorators() {
  console.group('EJEMPLO 3: Solo Algunos Decoradores');

  // Alerta simple con solo riesgo y ubicación
  let message: AlertMessage = new BaseAlertMessage(
    'Granizada',
    'Se espera granizada en el área.'
  );

  message = new RiskLevelAlertDecorator(message, 'AMARILLO');
  message = new LocationAlertDecorator(message, ['Sabaneta']);

  console.log('Alerta Simple (solo riesgo y ubicación):');
  console.log('Título:', message.getTitle());
  console.log('Cuerpo:', message.getBody());

  console.groupEnd();
}

/**
 * EJEMPLO 4: Usando AlertMessageBuilderService
 * Método más práctico para casos comunes
 */
export function example4_UsingBuilderService(builderService: AlertMessageBuilderService) {
  console.group('EJEMPLO 4: Builder Service (Métodos Factory)');

  // Construir alertas predefinidas
  const rainAlert = builderService.buildCriticalRainAlert();
  const landslideAlert = builderService.buildLandslideAlert();
  const floodAlert = builderService.buildFloodAlert();

  console.log('Alerta de lluvia intensa:');
  console.log('Título:', rainAlert.getTitle());
  console.log('Cuerpo (primeras líneas):', rainAlert.getBody().substring(0, 50) + '...');

  console.log('\nAlerta de deslizamiento:');
  console.log('Título:', landslideAlert.getTitle());

  console.log('\nAlerta de inundación:');
  console.log('Título:', floodAlert.getTitle());

  console.groupEnd();
}

/**
 * EJEMPLO 5: Fluent Builder (Construcción flexible)
 * Método más flexible para casos personalizados
 */
export function example5_FluentBuilder(builderService: AlertMessageBuilderService) {
  console.group('EJEMPLO 5: Fluent Builder (Construcción Flexible)');

  // Construir una alerta personalizada de forma fluida
  const customAlert = builderService
    .createBuilder()
    .withTitle('Alerta de Vientos Fuertes')
    .withBody('Se esperan vientos superiores a 60 km/h')
    .withRiskLevel('AMARILLO')
    .withLocations(['Medellín', 'Itaguí'])
    .withRecommendation('Asegure objetos sueltos. Evite actividades al aire libre.')
    .withPriority('Media')
    .withTimestamp()
    .build(); // Sin Plain Language para este ejemplo

  console.log('Alerta Personalizada:');
  console.log('Título:', customAlert.getTitle());
  console.log('Cuerpo:', customAlert.getBody());
  console.log('Metadata:', customAlert.getMetadata());

  console.groupEnd();
}

/**
 * EJEMPLO 6: Validación de contrato AlertMessage
 * Demuestra que todos los decoradores cumplen el contrato
 */
export function example6_ContractValidation() {
  console.group('EJEMPLO 6: Validación del Contrato AlertMessage');

  const base = new BaseAlertMessage('Base', 'Body');
  const withRisk = new RiskLevelAlertDecorator(base, 'ROJO');
  const withLocation = new LocationAlertDecorator(withRisk, ['Lugar']);
  const withRecommendation = new SafetyRecommendationAlertDecorator(withLocation, 'Recomendación');
  const withPriority = new PriorityAlertDecorator(withRecommendation, 'Alta');
  const withTimestamp = new TimestampAlertDecorator(withPriority, new Date());
  const withPlainLanguage = new PlainLanguageAlertDecorator(withTimestamp);

  // Verificar que todos implementan la interfaz
  const decorators: AlertMessage[] = [
    base,
    withRisk,
    withLocation,
    withRecommendation,
    withPriority,
    withTimestamp,
    withPlainLanguage
  ];

  console.log('Verificando que todos cumplen el contrato AlertMessage:');
  decorators.forEach((decorator, index) => {
    const hasGetTitle = typeof decorator.getTitle === 'function';
    const hasGetBody = typeof decorator.getBody === 'function';
    const hasGetMetadata = typeof decorator.getMetadata === 'function';

    const isValid = hasGetTitle && hasGetBody && hasGetMetadata;
    console.log(`  Decorador ${index}: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
  });

  console.log('\n✅ Todos los decoradores implementan correctamente el contrato AlertMessage');
  console.groupEnd();
}

/**
 * EJEMPLO 7: Integración con NotificationService
 * Muestra cómo usar el mensaje decorado en el envío de notificaciones
 */
export function example7_IntegrationWithNotification(
  builderService: AlertMessageBuilderService
) {
  console.group('EJEMPLO 7: Integración con NotificationService');

  // Construir mensaje decorado
  const decoratedMessage = builderService.buildCriticalRainAlert();

  // Simular el objeto Notification que se enviaría al NotificationService
  const notification = {
    title: decoratedMessage.getTitle(),
    message: decoratedMessage.getBody(),
    recipient: 'usuario@example.com',
    channels: ['sms', 'email', 'push', 'whatsapp']
  };

  console.log('Notificación preparada para envío:');
  console.log('Título:', notification.title);
  console.log('Mensaje (primeras líneas):', notification.message.substring(0, 100) + '...');
  console.log('Destinatario:', notification.recipient);
  console.log('Canales:', notification.channels);

  console.log('\n💡 Esta notificación sería enviada a través de:');
  notification.channels.forEach(channel => {
    console.log(`   - ${channel.toUpperCase()} Channel (via Factory Method)`);
  });

  console.groupEnd();
}

/**
 * EJEMPLO 8: Ventajas sobre la alternativa sin patrón
 * Muestra por qué el Decorator es mejor que tener múltiples subclases
 */
export function example8_AdvantagesOverSubclassing() {
  console.group('EJEMPLO 8: Ventajas del Patrón Decorator');

  console.log('❌ SIN PATRÓN (Explosión de subclases):');
  console.log('   - AlertWithRisk');
  console.log('   - AlertWithRiskAndLocation');
  console.log('   - AlertWithRiskAndLocationAndPriority');
  console.log('   - AlertWithRiskAndLocationAndPriorityAndTimestamp');
  console.log('   - ... (combinación exponencial)');
  console.log('\n   Con N decoradores diferentes, tendrías 2^N subclases posibles!');

  console.log('\n✅ CON PATRÓN DECORATOR (Composición flexible):');
  console.log('   - BaseAlertMessage (1 clase)');
  console.log('   - RiskLevelAlertDecorator (1 clase)');
  console.log('   - LocationAlertDecorator (1 clase)');
  console.log('   - PriorityAlertDecorator (1 clase)');
  console.log('   - TimestampAlertDecorator (1 clase)');
  console.log('   - SafetyRecommendationAlertDecorator (1 clase)');
  console.log('   - PlainLanguageAlertDecorator (1 clase)');
  console.log('\n   Solo 7 clases en total, y se pueden combinar en cualquier orden');

  console.log('\n🎯 RESULTADO:');
  console.log('   ✓ Menos código');
  console.log('   ✓ Más flexible');
  console.log('   ✓ Fácil de extender');
  console.log('   ✓ Respeta SOLID');

  console.groupEnd();
}
