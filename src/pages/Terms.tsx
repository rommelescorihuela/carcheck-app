import LegalPage from '../components/LegalPage'

export default function Terms() {
  return (
    <LegalPage title="Términos y condiciones" updatedAt="16 de noviembre de 2026">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">1. El servicio</h2>
        <p>
          CarCheck es una aplicación web para llevar el mantenimiento, combustible, documentos y
          gastos de vehículos, de forma individual o compartida con una organización. El servicio se
          presta a través de <strong>app.carcheck.digitalwebsolution.info</strong> y su API en{' '}
          <strong>api.carcheck.digitalwebsolution.info</strong>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">2. Cuenta y uso</h2>
        <p>
          Para usar CarCheck debes crear una cuenta con datos veraces y mantener la confidencialidad
          de tu contraseña. Eres responsable de la actividad realizada con tu cuenta y de los datos
          que registres. Debes ser mayor de edad y tener capacidad legal para contratar.
        </p>
        <p>
          No está permitido usar el servicio para actividades ilícitas, intentar acceder a cuentas o
          datos de terceros, interferir con la infraestructura o automatizar peticiones de forma
          abusiva.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">3. Planes, prueba y pagos</h2>
        <p>
          Los planes y sus límites se muestran dentro de la aplicación. La prueba gratuita dura el
          periodo indicado al contratar y no se renueva automáticamente. Los pagos son{' '}
          <strong>manuales</strong>: transferencia, Pago Móvil, Zelle o Binance, según las
          instrucciones de la pantalla de facturación. El pago se activa cuando el equipo revisa y
          aprueba el comprobante.
        </p>
        <p>
          Los precios se expresan en dólares estadounidenses (USD) y pueden pagarse en la moneda
          local según la tasa indicada. Los impuestos aplicables corren por cuenta del cliente.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">4. Contenido y datos del vehículo</h2>
        <p>
          Conservas la titularidad de los datos que registras. Nos autorizas a almacenarlos y
          procesarlos para prestarte el servicio, generar recordatorios y reportes, y atender
          soporte. Eres responsable de contar con autorización para registrar datos de vehículos o
          personas de tu organización.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">5. Disponibilidad y cambios</h2>
        <p>
          Trabajamos para mantener el servicio disponible, pero puede haber interrupciones por
          mantenimiento, actualizaciones o causas ajenas. Podemos modificar funciones y planes,
          avisando por la aplicación o por correo cuando el cambio sea relevante.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">6. Cancelación y baja</h2>
        <p>
          Puedes cancelar la suscripción o eliminar tu cuenta desde la aplicación. Si eres
          propietario de una organización, primero debes transferirla o eliminarla. La baja no
          genera reembolsos por periodos ya iniciados, salvo que la ley aplicable disponga otra cosa.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">7. Responsabilidad</h2>
        <p>
          CarCheck es una herramienta de registro y organización. No sustituye el manual del
          vehículo, la revisión de un mecánico ni el asesoramiento legal o fiscal. No respondemos por
          decisiones tomadas a partir de los recordatorios o reportes generados por la aplicación.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">8. Ley aplicable y contacto</h2>
        <p>
          Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Para
          consultas, escribe a <strong>soporte@digitalwebsolution.info</strong>.
        </p>
      </section>
    </LegalPage>
  )
}
