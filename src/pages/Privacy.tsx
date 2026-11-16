import LegalPage from '../components/LegalPage'

export default function Privacy() {
  return (
    <LegalPage title="Política de privacidad" updatedAt="16 de noviembre de 2026">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">1. Responsable</h2>
        <p>
          CarCheck es operado por Digital Web Solution. Para ejercer tus derechos o hacer consultas
          sobre tus datos, escribe a <strong>soporte@digitalwebsolution.info</strong>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">2. Datos que tratamos</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Datos de cuenta: nombre, correo, contraseña cifrada, moneda y preferencias.</li>
          <li>
            Datos de vehículos: marca, modelo, año, placa, VIN, odómetro, fotos, mantenimientos,
            combustible y documentos (incluidos archivos PDF o imágenes).
          </li>
          <li>Datos de organización: nombre, miembros, roles e invitaciones.</li>
          <li>
            Datos de facturación: plan, estado de la suscripción, pagos y comprobantes que subas.
          </li>
          <li>Datos técnicos: dirección IP, navegador, registros de acceso y errores.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">3. Para qué los usamos</h2>
        <p>
          Para crear y administrar tu cuenta, prestarte el servicio, calcular recordatorios y
          reportes, procesar pagos manuales, enviarte avisos por correo o notificaciones push,
          atender soporte, prevenir fraude y cumplir obligaciones legales.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">4. Base legal y consentimiento</h2>
        <p>
          Tratamos los datos necesarios para ejecutar el contrato de servicio y, cuando corresponde,
          con tu consentimiento (por ejemplo, notificaciones push). Puedes retirar el consentimiento
          en cualquier momento desde la aplicación o escribiéndonos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">5. Conservación y seguridad</h2>
        <p>
          Conservamos los datos mientras tu cuenta esté activa y durante el plazo necesario para
          cumplir obligaciones legales o resolver disputas. Aplicamos medidas técnicas y
          organizativas razonables: HTTPS, contraseñas cifradas, tokens con caducidad, control de
          acceso por roles y copias de seguridad.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">6. Terceros</h2>
        <p>
          Nos apoyamos en proveedores de hosting, base de datos, correo transaccional y notificaciones
          push. Solo acceden a los datos necesarios para prestar su servicio y bajo obligaciones de
          confidencialidad. No vendemos tus datos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">7. Tus derechos</h2>
        <p>
          Puedes acceder, corregir, actualizar o eliminar tus datos desde la sección «Mi cuenta» o
          escribiéndonos. También puedes oponerte a ciertos tratamientos y solicitar la portabilidad
          de tus datos. Responderemos en un plazo razonable.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">8. Cookies y almacenamiento local</h2>
        <p>
          Usamos almacenamiento local del navegador para mantener la sesión y recordar preferencias.
          No usamos cookies publicitarias ni rastreadores de terceros. Puedes borrar estos datos desde
          la configuración de tu navegador, aunque perderás la sesión.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">9. Cambios</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios en el servicio o en la ley. La
          versión vigente estará siempre publicada en esta página.
        </p>
      </section>
    </LegalPage>
  )
}
