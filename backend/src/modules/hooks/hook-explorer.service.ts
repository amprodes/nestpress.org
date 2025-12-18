/**
 * NestPress Hook Explorer
 * Auto-discovers and registers hook handlers from decorated classes
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { HooksService } from './hooks.service';
import {
  HOOK_HANDLERS_METADATA,
  HookHandlerMetadata,
  getHookProviderOptions,
  isHookProvider,
} from './decorators';

@Injectable()
export class HookExplorerService implements OnModuleInit {
  private readonly logger = new Logger(HookExplorerService.name);

  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly hooksService: HooksService,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    this.explore();
  }

  /**
   * Explore all modules and register hook handlers
   */
  private explore(): void {
    const providers = this.getAllProviders();
    let registeredCount = 0;

    for (const provider of providers) {
      const { instance, metatype } = provider;
      
      if (!instance || !metatype) continue;

      // Get hook handlers metadata from the class
      const handlers: HookHandlerMetadata[] = 
        Reflect.getMetadata(HOOK_HANDLERS_METADATA, metatype) || [];

      if (handlers.length === 0) continue;

      // Get provider options if it's a HookProvider
      const providerOptions = isHookProvider(metatype) 
        ? getHookProviderOptions(metatype) 
        : {};

      // Register each handler
      for (const handler of handlers) {
        this.registerHandler(instance, handler, providerOptions.namespace);
        registeredCount++;
      }
    }

    if (registeredCount > 0) {
      this.logger.log(`🪝 Discovered and registered ${registeredCount} hook handlers`);
    }
  }

  /**
   * Register a single hook handler
   */
  private registerHandler(
    instance: any,
    handler: HookHandlerMetadata,
    defaultNamespace?: string,
  ): void {
    const method = instance[handler.data.methodName];
    
    if (typeof method !== 'function') {
      this.logger.warn(
        `Hook handler method '${handler.data.methodName}' not found on instance`,
      );
      return;
    }

    // Bind the method to the instance
    const boundMethod = method.bind(instance);

    switch (handler.type) {
      case 'action':
        this.hooksService.addAction(
          handler.data.hookName,
          boundMethod,
          {
            ...handler.data.options,
            namespace: handler.data.options.namespace || defaultNamespace,
          },
        );
        this.logger.debug(
          `Registered action: ${handler.data.hookName} -> ${handler.data.methodName}`,
        );
        break;

      case 'filter':
        this.hooksService.addFilter(
          handler.data.hookName,
          boundMethod,
          {
            ...handler.data.options,
            namespace: handler.data.options.namespace || defaultNamespace,
          },
        );
        this.logger.debug(
          `Registered filter: ${handler.data.hookName} -> ${handler.data.methodName}`,
        );
        break;

      case 'ai':
        this.hooksService.addAIHook(
          handler.data.hookName,
          boundMethod,
          {
            ...handler.data.options,
            namespace: handler.data.options.namespace || defaultNamespace,
          },
        );
        this.logger.debug(
          `Registered AI hook: ${handler.data.hookName} -> ${handler.data.methodName}`,
        );
        break;
    }
  }

  /**
   * Get all providers from all modules
   */
  private getAllProviders(): InstanceWrapper[] {
    const providers: InstanceWrapper[] = [];

    this.modulesContainer.forEach((module) => {
      module.providers.forEach((provider) => {
        if (provider.instance) {
          providers.push(provider);
        }
      });
    });

    return providers;
  }
}
