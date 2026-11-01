import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    /*
     * provideRouter + <router-outlet> es el equivalente exacto de
     * <BrowserRouter> + <Routes> en React:
     *   - withComponentInputBinding() permite leer params/query params como
     *     inputs del componente en vez de suscribirse a ActivatedRoute.
     *   - withInMemoryScrolling() restaura el scroll al navegar, que es el
     *     comportamiento que da laScrollRestoration de React Router.
     */
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),

    // Necesario para CountriesService y PlacesService. En la versión React se
    // usaba `fetch` nativo sin configurar nada; Angular necesita este provider.
    //
    // withInterceptors mete el de autenticación, que es lo que añade la cabecera
    // Authorization. Va aquí, y no dentro de cada servicio, para que ninguna
    // llamada pueda salir sin el token por descuido.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    /*
     * Revalida el token guardado antes de pintar la aplicación.
     *
     * Sin esto, un usuario que recargue la página vería la cabecera con su
     * nombre (eso se lee del almacenamiento local) pero con el rol viejo, y
     * una llamada protegería con información desactualizada. El initializer
     * espera a que la promesa se resuelva, así que la primera vista ya se
     * dibuja con el estado bueno.
     */
    provideAppInitializer(() => inject(AuthService).restaurarSesion()),
  ],
};
