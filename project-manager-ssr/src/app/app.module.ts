import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule, Title } from '@angular/platform-browser';
import * as io from 'socket.io-client';
import { AppComponent } from './app.component';
import { appRouting, routingComponents } from './app.routing';
import { AUTH_ENABLED, SOCKET_IO } from './app.tokens';
import { LoginService } from './services/login-service/login-service';
import { SharedModule } from './shared/shared-module';


export function socketIoFactory() {
  return io;
}

const enableAuthentication = false;

@NgModule({
  imports: [BrowserModule.withServerTransition({ appId: 'serverApp' }),     BrowserTransferStateModule,
  SharedModule.forRoot(), appRouting],
  providers: [LoginService,
    Title,
    {provide: AUTH_ENABLED, useValue: enableAuthentication},
    {provide: SOCKET_IO, useFactory: socketIoFactory},
  ],
  declarations: [AppComponent, routingComponents],
  bootstrap: [AppComponent]
})
export class AppModule {
}
