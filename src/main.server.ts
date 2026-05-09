import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()]
};

const config = mergeApplicationConfig(appConfig, serverConfig);

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;