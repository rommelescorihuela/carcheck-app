import { Link } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import './landing.css'

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.2 4.9 8.5 9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Home() {
  const authenticated = useAuth((state) => state.status === 'authenticated')

  return (
    <div className="lp">
      <a className="lp-skip" href="#contenido">
        Saltar al contenido
      </a>

      <header className="lp-nav">
        <div className="lp-shell lp-nav-inner">
          <Link to="/" className="lp-brand" aria-label="CarCheck, inicio">
            <span className="lp-brand-mark" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 11.2 7.6 6h4.8L16 11.2v3.3a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8v-3.3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.4 11.2h9.2M7.4 8.4v.1M12.6 8.4v.1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            CarCheck
          </Link>

          <nav className="lp-nav-links" aria-label="Secciones">
            <a className="lp-nav-link" href="#como-funciona">
              Cómo funciona
            </a>
            <a className="lp-nav-link" href="#producto">
              La app
            </a>
            <a className="lp-nav-link" href="#precios">
              Precios
            </a>
            <a className="lp-nav-link" href="#preguntas">
              Preguntas
            </a>
          </nav>

          <div className="lp-nav-actions">
            {authenticated ? (
              <Link to="/vehiculos" className="lp-btn lp-btn-primary lp-btn-sm">
                Ir a mi garaje
                <span className="lp-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="lp-btn lp-btn-link lp-btn-sm">
                  Entrar
                </Link>
                <Link to="/register" className="lp-btn lp-btn-primary lp-btn-sm">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="contenido">
        <section className="lp-hero">
          <div className="lp-shell lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow">Mantenimiento de vehículos</p>
              <h1>
                Tu carro, <span className="lp-serif">en orden</span>.
              </h1>
              <p className="lp-lede">
                Mantenimientos, combustible, documentos y gastos en un solo lugar. Con
                recordatorios que llegan antes de que algo se venza — no después.
              </p>
              <div className="lp-hero-actions">
                <Link to="/register" className="lp-btn lp-btn-primary">
                  Empieza gratis
                  <span className="lp-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <a href="#producto" className="lp-btn lp-btn-ghost">
                  Ver la app
                </a>
              </div>
              <p className="lp-hero-note">14 días de prueba. Sin tarjeta de crédito.</p>
              <ul className="lp-hero-stats">
                <li>
                  <span className="lp-stat-value">Todo</span>
                  <span className="lp-stat-label">el historial en un lugar</span>
                </li>
                <li>
                  <span className="lp-stat-value">Antes</span>
                  <span className="lp-stat-label">de que venza cada papel</span>
                </li>
                <li>
                  <span className="lp-stat-value">$3.99</span>
                  <span className="lp-stat-label">al mes, desde</span>
                </li>
              </ul>
            </div>

            <div className="lp-hero-visual">
              <div className="lp-hero-photo">
                <img
                  src="/images/hero-driving.webp"
                  alt="Persona conduciendo un auto al atardecer"
                  width={1200}
                  height={1500}
                  fetchPriority="high"
                />
              </div>
              <span className="lp-hero-stamp">
                <span className="lp-dot" aria-hidden="true" />
                Al día
              </span>
              <div className="lp-float-card">
                <span className="lp-float-icon" aria-hidden="true">
                  <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 8.5h10v6.2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.2 8.5V6.4a2.8 2.8 0 0 1 5.6 0v2.1M5 12.2h10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div className="lp-float-body">
                  <p className="lp-float-eyebrow">Toyota Corolla · 42.500 km</p>
                  <p className="lp-float-title">Cambio de aceite</p>
                  <p className="lp-float-sub">En 12 días · Taller El Rápido</p>
                </div>
                <span className="lp-float-badge">Programado</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-trust" aria-label="Qué resuelve CarCheck">
          <div className="lp-shell lp-trust-grid">
            <div className="lp-trust-item">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M10 5.8V10l2.8 1.8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>
                <strong>Recordatorios que sí llegan</strong>
                Seguro, revisión e impuestos avisados con semanas de margen.
              </p>
            </div>
            <div className="lp-trust-item">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M4.5 3.5h7l4 4v9a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.5 3.7V8h4.1M7 11.5h6M7 14.2h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p>
                <strong>Un historial que vale</strong>
                Cada servicio, repuesto y gasto listo para mostrar al vender.
              </p>
            </div>
            <div className="lp-trust-item">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect
                  x="6"
                  y="2.8"
                  width="8"
                  height="14.4"
                  rx="1.8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M8.8 14.6h2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p>
                <strong>En tu teléfono, sin instalar</strong>
                Se abre desde el navegador y queda como una app en tu pantalla.
              </p>
            </div>
          </div>
        </section>

        <section className="lp-section" id="como-funciona">
          <div className="lp-shell lp-how-grid">
            <div className="lp-how-copy">
              <span className="lp-kicker">Cómo funciona</span>
              <h2>
                Tres pasos y tu carro deja de ser <span className="lp-serif">un misterio</span>.
              </h2>
              <p>
                No necesitas una hoja de cálculo ni una carpeta llena de facturas. Solo
                registrar lo importante cuando pasa.
              </p>
              <figure className="lp-how-photo">
                <img
                  src="/images/maintenance-oil.webp"
                  alt="Manos vertiendo aceite nuevo en el motor de un auto"
                  width={1200}
                  height={900}
                  loading="lazy"
                />
                <figcaption>Cada servicio que registras construye el historial.</figcaption>
              </figure>
            </div>
            <ol className="lp-steps">
              <li className="lp-step">
                <span className="lp-step-num" aria-hidden="true">
                  01
                </span>
                <div>
                  <h3>Agrega tu vehículo</h3>
                  <p>
                    Marca, modelo, año, placa y kilometraje. Si tienes varios — o compartes
                    autos en familia — cada uno lleva su propio historial.
                  </p>
                </div>
              </li>
              <li className="lp-step">
                <span className="lp-step-num" aria-hidden="true">
                  02
                </span>
                <div>
                  <h3>Registra lo que pasa</h3>
                  <p>
                    Cambios de aceite, frenos, alineación, cargas de combustible, seguros y
                    documentos. Con taller, costo y comprobante si los tienes.
                  </p>
                </div>
              </li>
              <li className="lp-step">
                <span className="lp-step-num" aria-hidden="true">
                  03
                </span>
                <div>
                  <h3>Recibe el aviso a tiempo</h3>
                  <p>
                    CarCheck calcula vencimientos y próximos servicios. Tú decides qué hacer;
                    la app se encarga de que no se te pase.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="lp-product" id="producto">
          <div className="lp-shell lp-product-grid">
            <div>
              <span className="lp-kicker">La app</span>
              <h2>
                Tus pendientes, <span className="lp-serif">a la vista</span>.
              </h2>
              <p className="lp-product-lede">
                Una pantalla para saber qué está vencido, qué viene pronto y qué ya resolviste.
                Sin buscar entre correos ni preguntar en el taller.
              </p>
              <ul className="lp-checklist">
                <li>
                  <span className="lp-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  Vencidos y próximos, separados y ordenados por fecha.
                </li>
                <li>
                  <span className="lp-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  Cada aviso conectado al vehículo y al documento que lo origina.
                </li>
                <li>
                  <span className="lp-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  Reportes de gasto por vehículo, exportables a CSV.
                </li>
                <li>
                  <span className="lp-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  Descarta lo que ya atendiste y sigue con lo demás.
                </li>
              </ul>
              <p className="lp-product-note">Captura real de CarCheck en un teléfono.</p>
            </div>
            <div className="lp-phone-stage">
              <div className="lp-phone">
                <div className="lp-phone-screen">
                  <img
                    src="/images/app-reminders.png"
                    alt="Pantalla de recordatorios de CarCheck con avisos vencidos y próximos"
                    width={780}
                    height={1234}
                  />
                </div>
              </div>
              <p className="lp-phone-caption">Recordatorios · Toyota Corolla</p>
            </div>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="flotas-titulo">
          <div className="lp-shell">
            <div className="lp-fleet">
              <img
                src="/images/fleet-car.webp"
                alt="Auto aparcado frente a un edificio"
                width={1200}
                height={900}
                loading="lazy"
              />
              <div className="lp-fleet-body">
                <span className="lp-kicker">Para talleres y familias</span>
                <h2 id="flotas-titulo">Un garaje compartido, sin perder el detalle.</h2>
                <p>
                  Crea una organización, invita a tus mecánicos o a tu familia y trabajen sobre
                  el mismo historial. Cada movimiento queda registrado y cada vehículo conserva
                  su dueño y sus fechas.
                </p>
                <Link to="/register" className="lp-btn lp-btn-light">
                  Probar con mi equipo
                  <span className="lp-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section" id="precios" style={{ paddingTop: 0 }}>
          <div className="lp-shell">
            <div className="lp-section-head">
              <div>
                <span className="lp-kicker">Precios</span>
                <h2>
                  Un plan para cada <span className="lp-serif">garaje</span>.
                </h2>
              </div>
              <p>
                Todos incluyen 14 días de prueba y puedes cambiar o cancelar cuando quieras.
                Sin costos escondidos.
              </p>
            </div>

            <div className="lp-pricing-grid">
              <article className="lp-plan">
                <h3 className="lp-plan-name">Básico</h3>
                <p className="lp-plan-desc">Un vehículo y su historial completo.</p>
                <p className="lp-price">
                  <span className="lp-price-value">$3.99</span>
                  <span className="lp-price-period">/ mes</span>
                </p>
                <ul className="lp-plan-list">
                  <li>
                    <CheckIcon /> 1 vehículo
                  </li>
                  <li>
                    <CheckIcon /> Mantenimiento, combustible y documentos
                  </li>
                  <li>
                    <CheckIcon /> Recordatorios de vencimiento
                  </li>
                  <li>
                    <CheckIcon /> Reportes de gasto y exportación CSV
                  </li>
                </ul>
                <div className="lp-plan-cta">
                  <Link to="/register" className="lp-btn lp-btn-ghost">
                    Empezar con Básico
                  </Link>
                </div>
              </article>

              <article className="lp-plan lp-plan-featured">
                <span className="lp-plan-tag">Para familias</span>
                <h3 className="lp-plan-name">Familiar</h3>
                <p className="lp-plan-desc">
                  Hasta 5 vehículos compartidos con tu organización.
                </p>
                <p className="lp-price">
                  <span className="lp-price-value">$7.99</span>
                  <span className="lp-price-period">/ mes</span>
                </p>
                <ul className="lp-plan-list">
                  <li>
                    <CheckIcon /> Hasta 5 vehículos
                  </li>
                  <li>
                    <CheckIcon /> Hasta 5 miembros en la organización
                  </li>
                  <li>
                    <CheckIcon /> Todo lo del plan Básico
                  </li>
                  <li>
                    <CheckIcon /> Historial compartido en tiempo real
                  </li>
                </ul>
                <div className="lp-plan-cta">
                  <Link to="/register" className="lp-btn lp-btn-primary">
                    Empezar con Familiar
                  </Link>
                </div>
              </article>

              <article className="lp-plan">
                <h3 className="lp-plan-name">Taller</h3>
                <p className="lp-plan-desc">
                  Vehículos y miembros sin límite para talleres.
                </p>
                <p className="lp-price">
                  <span className="lp-price-value">$19.99</span>
                  <span className="lp-price-period">/ mes</span>
                </p>
                <ul className="lp-plan-list">
                  <li>
                    <CheckIcon /> Vehículos ilimitados
                  </li>
                  <li>
                    <CheckIcon /> Miembros ilimitados
                  </li>
                  <li>
                    <CheckIcon /> Todo lo del plan Familiar
                  </li>
                  <li>
                    <CheckIcon /> Historial por cliente y por vehículo
                  </li>
                </ul>
                <div className="lp-plan-cta">
                  <Link to="/register" className="lp-btn lp-btn-ghost">
                    Empezar con Taller
                  </Link>
                </div>
              </article>
            </div>

            <p className="lp-pricing-note">
              14 días de prueba en todos los planes. Precios en USD, facturación mensual.
            </p>
          </div>
        </section>

        <section className="lp-section" id="preguntas" style={{ paddingTop: 0 }}>
          <div className="lp-shell lp-faq-grid">
            <div>
              <span className="lp-kicker">Preguntas</span>
              <h2>Lo que suelen preguntar.</h2>
              <p>
                ¿Falta algo? Escríbenos a{' '}
                <a href="mailto:hola@carcheck.app">hola@carcheck.app</a> y te respondemos.
              </p>
            </div>
            <div className="lp-faq-list">
              <details className="lp-faq-item">
                <summary>
                  ¿Necesito tarjeta para probarlo?
                  <span className="lp-faq-plus" aria-hidden="true" />
                </summary>
                <p className="lp-faq-answer">
                  No. Los 14 días de prueba empiezan al crear tu cuenta y no piden medio de
                  pago. Si decides seguir, eliges el plan desde Facturación.
                </p>
              </details>
              <details className="lp-faq-item">
                <summary>
                  ¿Puedo llevar varios carros?
                  <span className="lp-faq-plus" aria-hidden="true" />
                </summary>
                <p className="lp-faq-answer">
                  Sí. El plan Básico incluye uno, Familiar hasta cinco y Taller no tiene límite.
                  Cada vehículo mantiene su propio historial, sus documentos y sus recordatorios.
                </p>
              </details>
              <details className="lp-faq-item">
                <summary>
                  ¿Sirve si comparto el carro con mi familia o taller?
                  <span className="lp-faq-plus" aria-hidden="true" />
                </summary>
                <p className="lp-faq-answer">
                  Sí. Puedes crear una organización e invitar miembros por correo. Todos ven y
                  actualizan el mismo historial, y tú mantienes el control de quién entra.
                </p>
              </details>
              <details className="lp-faq-item">
                <summary>
                  ¿Qué pasa si vendo el vehículo?
                  <span className="lp-faq-plus" aria-hidden="true" />
                </summary>
                <p className="lp-faq-answer">
                  Exportas el historial y los gastos en CSV desde Reportes. Es la prueba más
                  clara de cómo se cuidó el carro y un buen argumento al negociar el precio.
                </p>
              </details>
              <details className="lp-faq-item">
                <summary>
                  ¿Funciona en el teléfono?
                  <span className="lp-faq-plus" aria-hidden="true" />
                </summary>
                <p className="lp-faq-answer">
                  CarCheck es una aplicación web: se abre desde el navegador y puedes añadirla a
                  la pantalla de inicio para usarla como cualquier app. No necesitas descargar
                  nada de una tienda.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="lp-final">
          <div className="lp-shell">
            <div className="lp-final-inner">
              <h2>
                Que el próximo <span className="lp-serif">“se me olvidó”</span> no te salga caro.
              </h2>
              <p>
                Empieza hoy con tus vehículos. En cinco minutos tendrás el historial ordenado y
                los próximos vencimientos bajo control.
              </p>
              <div className="lp-final-actions">
                {authenticated ? (
                  <Link to="/vehiculos" className="lp-btn lp-btn-light">
                    Ir a mi garaje
                    <span className="lp-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="lp-btn lp-btn-light">
                      Crear mi cuenta gratis
                      <span className="lp-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                    <Link to="/login" className="lp-btn lp-btn-ghost">
                      Ya tengo cuenta
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-shell lp-footer-inner">
          <p className="lp-footer-note">© 2026 CarCheck. Hecho para quienes cuidan su carro.</p>
          <nav className="lp-footer-links" aria-label="Enlaces del pie">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#precios">Precios</a>
            <a href="#preguntas">Preguntas</a>
            {authenticated ? (
              <Link to="/vehiculos">Mi garaje</Link>
            ) : (
              <Link to="/login">Iniciar sesión</Link>
            )}
          </nav>
        </div>
      </footer>
    </div>
  )
}
