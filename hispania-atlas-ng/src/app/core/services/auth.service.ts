/**
 * src/app/core/services/auth.service.ts
 *
 * Estado de sesión del usuario, basado en `signal`.
 *
 * En React esto era un `AuthContext` con `useState`. La diferencia estructural es
 * que aquí no hay Provider: el servicio es `providedIn: 'root'`, así que existe
 * una sola instancia y cualquier componente la obtiene con `inject(AuthService)`.
 * Los componentes que lo usan declaran `implements OnInit` solo para lo que
 * necesitan del ciclo de vida, no para obtener el servicio.
 *
 * El token se guarda en `localStorage` porque el backend es stateless: en cada
 * petición hay que presentarlo, y no hay cookie de sesión que lo haga solo.
 * Es la opción razonable aquí, pero conviene ser consciente del intercambio:
 * `localStorage` es accesible desde cualquier JavaScript que se ejecute en la
 * página, así que un XSS se convierte en un robo de sesión. La alternativa
 * segura es una cookie `httpOnly`, que obliga a activar CSRF y a revisar el
 * `SameSite`; con una API sin estado, el coste no compensa para este proyecto.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { puede } from '../auth/roles';
import type { AuthResponse, LoginRequest, RegistroRequest, Rol, Usuario } from '../models';

const CLAVE_TOKEN = 'hispania.token';
const CLAVE_USUARIO = 'hispania.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly _token = signal<string | null>(leerToken());
  private readonly _usuario = signal<Usuario | null>(leerUsuario());

  /** El token actual, o `null` si no hay sesión. */
  readonly token = this._token.asReadonly();

  /** Datos de la cuenta autenticada, o `null`. */
  readonly usuario = this._usuario.asReadonly();

  readonly autenticado = computed(() => this._token() !== null);

  /** Rol vigente, según la última respuesta del servidor. */
  readonly rol = computed<Rol | null>(() => this._usuario()?.rol ?? null);

  /** Nombre a mostrar en la cabecera: el `nombre` si lo puso, si no el username. */
  readonly nombreVisible = computed(
    () => this._usuario()?.nombre || this._usuario()?.username || '',
  );

  async login(credenciales: LoginRequest): Promise<Usuario> {
    return this.establecerSesion(
      await firstValueFrom(
        this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credenciales),
      ),
    );
  }

  async registro(datos: RegistroRequest): Promise<Usuario> {
    return this.establecerSesion(
      await firstValueFrom(
        this.http.post<AuthResponse>(`${this.baseUrl}/auth/registro`, datos),
      ),
    );
  }

  /**
   * Revalida el token guardado contra el servidor y lo sustituye por uno nuevo.
   *
   * Hace falta porque el rol viaja dentro del token: si un administrador acaba de
   * promover a alguien, el token antiguo sigue diciendo `USUARIO` hasta que caduca.
   * Por eso `GET /auth/yo` no devuelve solo los datos de la cuenta, sino también
   * un token recién firmado con el rol que figura ahora en la base. Sin ese token
   * nuevo, el menú mostraría «Moderar propuestas» y cada llamada devolvería 403.
   *
   * `establecerSesion` se encarga de guardar el token y el usuario, así que este
   * método no distingue entre un ingreso y una revalidación.
   *
   * Si el token caducó o la cuenta se desactivó, el servidor responde 401 y se
   * cierra la sesión en vez de dejar al usuario en una pantalla a la que ya no
   * tiene acceso. Por eso `logout()` va dentro del `catch`: el fallo de la
   * revalidación no debe impedir limpiar el estado local.
   */
  async restaurarSesion(): Promise<void> {
    if (this._token() === null) {
      return;
    }
    try {
      this.establecerSesion(
        await firstValueFrom(
          this.http.get<AuthResponse>(`${this.baseUrl}/auth/yo`),
        ),
      );
    } catch {
      this.logout();
    }
  }

  /**
   * Cierra la sesión y borra lo guardado.
   *
   * No hay que avisar al backend: el token es un JWT que el servidor no guarda,
   * así que caduca solo. Ignorarlo aquí es correcto y es una de las ventajas de
   * no tener sesiones en servidor.
   */
  logout(): void {
    this._token.set(null);
    this._usuario.set(null);
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
  }

  /** ¿El rol actual llega al mínimo? Para pintar botones en la plantilla. */
  puede(minimo: Rol): boolean {
    return puede(this.rol(), minimo);
  }

  private establecerSesion(respuesta: AuthResponse): Usuario {
    this._token.set(respuesta.token);
    this._usuario.set(respuesta.usuario);
    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
    return respuesta.usuario;
  }
}

function leerToken(): string | null {
  const valor = localStorage.getItem(CLAVE_TOKEN);
  return valor === null || valor === '' ? null : valor;
}

/**
 * Lee la cuenta cacheada para que la cabecera tenga nombre y rol desde el
 * primer momento, sin esperar a la revalidación.
 *
 * Si el JSON está corrupto (un despliegue a medias, un cambio de formato), se
 * descarta en vez de romper el arranque de la aplicación.
 */
function leerUsuario(): Usuario | null {
  const guardado = localStorage.getItem(CLAVE_USUARIO);
  if (guardado === null) {
    return null;
  }
  try {
    return JSON.parse(guardado) as Usuario;
  } catch {
    localStorage.removeItem(CLAVE_USUARIO);
    return null;
  }
}
