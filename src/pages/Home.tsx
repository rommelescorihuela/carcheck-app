import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
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

const SHOTS = [
  {
    id: 'recordatorios',
    label: 'Recordatorios',
    detail: 'Lo que vence y lo que viene, ordenado por fecha.',
    src: '/images/app-reminders.png',
    alt: 'Pantalla de recordatorios de CarCheck con avisos vencidos y próximos',
    caption: 'Recordatorios · Toyota Corolla',
  },
  {
    id: 'documentos',
    label: 'Documentos',
    detail: 'Seguro, revisión e impuestos con su estado real.',
    src: '/images/app-documents.png',
    alt: 'Pantalla de documentos del vehículo con totales, por vencer y vencidos',
    caption: 'Documentos · Toyota Corolla',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    detail: 'Cuánto gastaste por vehículo, por mes y por concepto.',
    src: '/images/app-reports.png',
    alt: 'Pantalla de reportes de gasto por vehículo con totales del periodo',
    caption: 'Reportes · Año en curso',
  },
]

const SERVICES = [
  'Cambio de aceite',
  'Frenos',
  'Seguro',
  'Revisión',
  'Neumáticos',
  'Combustible',
  'Impuestos',
  'Documentos',
]

export default function Home() {
  const authenticated = useAuth((state) => state.status === 'authenticated')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeShot, setActiveShot] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('is-in'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = SHOTS.length - 1
    let next: number | null = null

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = activeShot === last ? 0 : activeShot + 1
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = activeShot === 0 ? last : activeShot - 1
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = last
    }

    if (next === null) return
    event.preventDefault()
    setActiveShot(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="lp" ref={rootRef}>
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
          <div className="lp-shell lp-hero-inner">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow">Mantenimiento de vehículos</p>
              <h1>
                Tu carro, <em className="lp-serif">en orden</em>.
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

          <div className="lp-shell lp-hero-foot">
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
        </section>

        <section className="lp-dark lp-manifesto" aria-labelledby="manifiesto-titulo">
          <div className="lp-marquee" aria-hidden="true">
            <div className="lp-marquee-track">
              {[0, 1].map((copy) => (
                <div className="lp-marquee-group" key={copy}>
                  {SERVICES.map((service) => (
                    <span className="lp-marquee-item" key={service}>
                      {service}
                      <span className="lp-marquee-mark">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="lp-shell lp-manifesto-grid">
            <div className="lp-manifesto-copy" data-reveal>
              <span className="lp-kicker lp-kicker-invert">Por qué existe</span>
              <h2 id="manifiesto-titulo">
                Un carro no se daña de golpe. Se daña cuando{' '}
                <span className="lp-serif">nadie lleva la cuenta</span>.
              </h2>
              <p>
                CarCheck es esa libreta que sí se acuerda: qué toca, cuándo toca y cuánto
                costó. Sin hojas de cálculo, sin facturas en la guantera, sin fechas en la
                cabeza.
              </p>
            </div>

            <ul className="lp-manifesto-list">
              <li data-reveal>
                <span className="lp-manifesto-num" aria-hidden="true">
                  01
                </span>
                <div>
                  <h3>El aceite se pasa de fecha</h3>
                  <p>Y lo notas cuando el motor ya suena distinto.</p>
                </div>
              </li>
              <li data-reveal className="d1">
                <span className="lp-manifesto-num" aria-hidden="true">
                  02
                </span>
                <div>
                  <h3>El seguro vence en silencio</h3>
                  <p>La multa llega antes que el aviso. Siempre.</p>
                </div>
              </li>
              <li data-reveal className="d2">
                <span className="lp-manifesto-num" aria-hidden="true">
                  03
                </span>
                <div>
                  <h3>El historial se pierde</h3>
                  <p>Facturas en la guantera, fotos en el chat, nada junto.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="lp-section lp-how" id="como-funciona">
          <div className="lp-shell">
            <div className="lp-section-head" data-reveal>
              <div>
                <span className="lp-kicker">Cómo funciona</span>
                <h2>
                  Tres pasos y tu carro deja de ser <span className="lp-serif">un misterio</span>.
                </h2>
              </div>
              <p>
                No necesitas una hoja de cálculo ni una carpeta llena de facturas. Solo
                registrar lo importante cuando pasa.
              </p>
            </div>

            <div className="lp-how-grid">
              <figure className="lp-how-photo" data-reveal>
                <img
                  src="/images/maintenance-oil.webp"
                  alt="Manos vertiendo aceite nuevo en el motor de un auto"
                  width={1200}
                  height={900}
                  loading="lazy"
                />
                <figcaption>Cada servicio que registras construye el historial.</figcaption>
              </figure>

              <ol className="lp-steps">
                <li className="lp-step" data-reveal>
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
                <li className="lp-step d1" data-reveal>
                  <span className="lp-step-num" aria-hidden="true">
                    02
                  </span>
                  <div>
                    <h3>Registra lo que pasa</h3>
                    <p>
                      Cambios de aceite, frenos, alineación, cargas de combustible, seguros y
                      documentos. Con proveedor, costo y comprobante si los tienes.
                    </p>
                  </div>
                </li>
                <li className="lp-step d2" data-reveal>
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
          </div>
        </section>

        <section className="lp-dark lp-product" id="producto" aria-labelledby="producto-titulo">
          <div className="lp-shell lp-product-grid">
            <div className="lp-product-copy" data-reveal>
              <span className="lp-kicker lp-kicker-invert">La app</span>
              <h2 id="producto-titulo">
                Todo lo que tu carro necesita, <span className="lp-serif">en una pantalla</span>.
              </h2>
              <p className="lp-product-lede">
                Sabes qué está vencido, qué viene pronto y qué ya resolviste. Sin buscar entre
                correos ni hojas de cálculo.
              </p>
            </div>

            <div
              className="lp-tabs"
              role="tablist"
              aria-label="Pantallas de la app"
              onKeyDown={onTabKeyDown}
            >
              {SHOTS.map((shot, index) => (
                <button
                  key={shot.id}
                  ref={(node) => {
                    tabRefs.current[index] = node
                  }}
                  id={`tab-${shot.id}`}
                  className="lp-tab"
                  type="button"
                  role="tab"
                  aria-selected={index === activeShot}
                  aria-controls={`panel-${shot.id}`}
                  tabIndex={index === activeShot ? 0 : -1}
                  onClick={() => setActiveShot(index)}
                >
                  <span className="lp-tab-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span className="lp-tab-text">
                    <span className="lp-tab-label">{shot.label}</span>
                    <span className="lp-tab-detail">{shot.detail}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="lp-phone-stage">
              <div className="lp-phone">
                <div className="lp-phone-screen">
                  {SHOTS.map((shot, index) => (
                    <div
                      key={shot.id}
                      id={`panel-${shot.id}`}
                      role="tabpanel"
                      aria-labelledby={`tab-${shot.id}`}
                      hidden={index !== activeShot}
                      className="lp-shot"
                    >
                      <img
                        src={shot.src}
                        alt={shot.alt}
                        width={780}
                        height={1234}
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <p className="lp-phone-caption">{SHOTS[activeShot].caption}</p>
              <p className="lp-phone-note">Capturas reales de CarCheck en un teléfono.</p>
            </div>
          </div>
        </section>

        <section className="lp-section lp-fleet-section" aria-labelledby="flotas-titulo">
          <div className="lp-shell">
            <div className="lp-fleet" data-reveal>
              <img
                src="/images/fleet-car.webp"
                alt="Auto aparcado frente a un edificio"
                width={1200}
                height={900}
                loading="lazy"
              />
              <div className="lp-fleet-body">
                <span className="lp-kicker lp-kicker-invert">Para flotas y familias</span>
                <h2 id="flotas-titulo">Un garaje compartido, sin perder el detalle.</h2>
                <p>
                  Crea una flota, invita a tus conductores y trabajen sobre el mismo historial.
                  Cada carga y cada servicio queda registrado con quién lo hizo, y cada vehículo
                  conserva su dueño y sus fechas. Carga decenas de vehículos desde un CSV y mira
                  el gasto de toda la flota en una pantalla.
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

        <section className="lp-section lp-pricing" id="precios">
          <div className="lp-shell">
            <div className="lp-section-head" data-reveal>
              <div>
                <span className="lp-kicker">Precios</span>
                <h2>
                  Un plan para cada <span className="lp-serif">garaje</span> y cada flota.
                </h2>
              </div>
              <p>
                Todos incluyen 14 días de prueba y puedes cambiar o cancelar cuando quieras.
                Sin costos escondidos.
              </p>
            </div>

            <div className="lp-pricing-grid">
              <article className="lp-plan d1" data-reveal>
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

              <article className="lp-plan d2" data-reveal>
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

              <article className="lp-plan lp-plan-featured" data-reveal>
                <span className="lp-plan-tag">Para flotas</span>
                <h3 className="lp-plan-name">Flota</h3>
                <p className="lp-plan-desc">
                  Hasta 25 vehículos y 10 personas, con conductores y reportes.
                </p>
                <p className="lp-price">
                  <span className="lp-price-value">$29.99</span>
                  <span className="lp-price-period">/ mes</span>
                </p>
                <ul className="lp-plan-list">
                  <li>
                    <CheckIcon /> Hasta 25 vehículos
                  </li>
                  <li>
                    <CheckIcon /> Hasta 10 personas, conductores incluidos
                  </li>
                  <li>
                    <CheckIcon /> Alta masiva desde CSV
                  </li>
                  <li>
                    <CheckIcon /> Vista consolidada y todo lo del plan Familiar
                  </li>
                </ul>
                <div className="lp-plan-cta">
                  <Link to="/register" className="lp-btn lp-btn-primary">
                    Empezar con Flota
                  </Link>
                </div>
              </article>

              <article className="lp-plan d3" data-reveal>
                <h3 className="lp-plan-name">Empresa</h3>
                <p className="lp-plan-desc">
                  Hasta 75 vehículos y 25 personas para operaciones grandes.
                </p>
                <p className="lp-price">
                  <span className="lp-price-value">$59.99</span>
                  <span className="lp-price-period">/ mes</span>
                </p>
                <ul className="lp-plan-list">
                  <li>
                    <CheckIcon /> Hasta 75 vehículos
                  </li>
                  <li>
                    <CheckIcon /> Hasta 25 personas en la organización
                  </li>
                  <li>
                    <CheckIcon /> Todo lo del plan Flota
                  </li>
                  <li>
                    <CheckIcon /> Atención prioritaria por correo
                  </li>
                </ul>
                <div className="lp-plan-cta">
                  <Link to="/register" className="lp-btn lp-btn-ghost">
                    Empezar con Empresa
                  </Link>
                </div>
              </article>
            </div>

            <p className="lp-pricing-note">
              14 días de prueba en todos los planes. Precios en USD, facturación mensual.
            </p>
          </div>
        </section>

        <section className="lp-section lp-faq-section" id="preguntas">
          <div className="lp-shell lp-faq-grid">
            <div data-reveal>
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
                  Sí. Básico incluye uno, Familiar hasta cinco, Flota hasta 25 y Empresa hasta 75.
                  Cada vehículo mantiene su propio historial, sus documentos y sus recordatorios.
                </p>
              </details>
              <details className="lp-faq-item">
                <summary>
                  ¿Puedo cargar mi flota de una vez?
                  <span className="lp-faq-plus" aria-hidden="true" />
                </summary>
                <p className="lp-faq-answer">
                  Sí. Sube un CSV con marca y modelo —y opcionalmente año, placa, VIN, combustible
                  y kilometraje— y CarCheck crea los vehículos de una vez, respetando el límite de
                  tu plan y diciéndote qué filas quedaron fuera y por qué.
                </p>
              </details>
              <details className="lp-faq-item">
                <summary>
                  ¿Qué puede hacer un conductor?
                  <span className="lp-faq-plus" aria-hidden="true" />
                </summary>
                <p className="lp-faq-answer">
                  Registrar combustible y mantenimiento desde su teléfono, con su nombre en cada
                  registro. No puede dar de alta vehículos, invitar gente ni tocar la facturación:
                  eso queda en manos del propietario y los administradores.
                </p>
              </details>
              <details className="lp-faq-item">
                <summary>
                  ¿Sirve si comparto el carro con mi familia o con mi flota?
                  <span className="lp-faq-plus" aria-hidden="true" />
                </summary>
                <p className="lp-faq-answer">
                  Sí. Puedes crear una organización e invitar miembros y conductores por correo.
                  Todos ven y actualizan el mismo historial, y tú mantienes el control de quién
                  entra y con qué rol.
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

        <section className="lp-final" aria-labelledby="final-titulo">
          <img
            className="lp-final-photo"
            src="/images/engine-detail.webp"
            alt=""
            width={1200}
            height={900}
            loading="lazy"
          />
          <div className="lp-shell lp-final-inner">
            <div className="lp-final-copy" data-reveal>
              <h2 id="final-titulo">
                Que el próximo{' '}
                <span className="lp-serif lp-nowrap">“se me olvidó”</span> no te salga caro.
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
