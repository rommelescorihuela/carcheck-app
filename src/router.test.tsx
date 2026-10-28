import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from './router'

describe('router', () => {
  it('renderiza la home en /', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: /tu carro, en orden/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /empieza gratis/i })).toHaveAttribute(
      'href',
      '/register',
    )
  })

  it('redirige a /login cuando la ruta es protegida y no hay sesión', async () => {
    localStorage.clear()

    const router = createMemoryRouter(routes, { initialEntries: ['/organizaciones/nueva'] })
    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })
})
