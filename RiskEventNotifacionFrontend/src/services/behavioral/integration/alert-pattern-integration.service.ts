import { Injectable } from '@angular/core';
import type { AlertMessage } from '../../decorator/alert-message.interface';
import { AlertMessageBuilderService } from '../../decorator/alert-message-builder.service';
import type { AlertPresentationViewModel } from '../strategy/alert-presentation-strategy.interface';

export type FactoryChannelName = 'sms' | 'email' | 'push' | 'whatsapp';
export type DecoratorRiskLevel = 'NARANJA' | 'ROJO' | 'GRIS';

export interface DecoratedAlertPayload {
  decoratedTitle: string;
  decoratedMessage: string;
  decoratorRiskLevel: DecoratorRiskLevel;
  decoratorAlertType: string;
  factoryChannels: FactoryChannelName[];
  decoratedMessageObject: AlertMessage;
}

/**
 * Servicio de coordinacion para demostrar la integracion entre patrones.
 *
 * No modifica Factory Method ni los decoradores concretos existentes; adapta
 * la salida de Strategy para que Decorator enriquezca exactamente la misma
 * alerta activa y Factory Method cree solo los canales que llegan desde backend.
 */
@Injectable({ providedIn: 'root' })
export class AlertPatternIntegrationService {
  private readonly channelCodeMap = new Map<number, FactoryChannelName>([
    [1, 'sms'],
    [2, 'email'],
    [3, 'push'],
    [4, 'whatsapp']
  ]);

  constructor(private alertMessageBuilder: AlertMessageBuilderService) {}

  enrichViewModel(view: AlertPresentationViewModel): AlertPresentationViewModel {
    const decorated = this.decorateAlert(view);

    return {
      ...view,
      decoratedTitle: decorated.decoratedTitle,
      decoratedMessage: decorated.decoratedMessage,
      decoratorRiskLevel: decorated.decoratorRiskLevel,
      decoratorAlertType: decorated.decoratorAlertType,
      factoryChannels: decorated.factoryChannels
    };
  }

  decorateAlert(view: AlertPresentationViewModel): DecoratedAlertPayload {
    const decoratorRiskLevel = this.resolveDecoratorRiskLevel(view);
    const decoratorAlertType = this.resolveDecoratorAlertType(view);
    const factoryChannels = this.mapChannelCodesToFactoryChannels(view.channels);

    const decoratedMessage = this.alertMessageBuilder
      .createBuilder()
      .withTitle(view.title)
      .withBody(view.message)
      .withRiskLevel(decoratorRiskLevel)
      .withLocations([view.location])
      .withRecommendation(view.recommendation)
      .withPriority(this.toDecoratorPriority(view.priority))
      .withTimestamp()
      .withPlainLanguage()
      .build();

    return {
      decoratedTitle: decoratedMessage.getTitle(),
      decoratedMessage: decoratedMessage.getBody(),
      decoratorRiskLevel,
      decoratorAlertType,
      factoryChannels,
      decoratedMessageObject: decoratedMessage
    };
  }

  mapChannelCodesToFactoryChannels(channelCodes: number[]): FactoryChannelName[] {
    const mappedChannels = channelCodes
      .map(code => this.channelCodeMap.get(code))
      .filter((channel): channel is FactoryChannelName => Boolean(channel));

    const uniqueChannels = Array.from(new Set(mappedChannels));
    return uniqueChannels.length > 0 ? uniqueChannels : ['push'];
  }

  private resolveDecoratorRiskLevel(view: AlertPresentationViewModel): DecoratorRiskLevel {
    if (view.visualClass === 'risk-rain' || view.visualClass === 'risk-flood') {
      return 'NARANJA';
    }

    if (
      view.visualClass === 'risk-landslide' ||
      view.visualClass === 'risk-earthquake' ||
      view.visualClass === 'risk-hurricane'
    ) {
      return 'ROJO';
    }

    return 'GRIS';
  }

  private resolveDecoratorAlertType(view: AlertPresentationViewModel): string {
    switch (view.visualClass) {
      case 'risk-rain':
        return 'Lluvia';
      case 'risk-flood':
        return 'Inundacion';
      case 'risk-landslide':
        return 'Deslizamiento';
      case 'risk-earthquake':
        return 'Terremoto';
      case 'risk-hurricane':
        return 'Huracan';
      default:
        return 'Generica';
    }
  }

  private toDecoratorPriority(priority: AlertPresentationViewModel['priority']): 'Alta' | 'Media' | 'Baja' {
    if (priority === 'CRITICA' || priority === 'ALTA') return 'Alta';
    if (priority === 'MEDIA') return 'Media';
    return 'Baja';
  }
}
