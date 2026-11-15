import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/vue'
import { renderApp } from '@/test/render'
import { buildTask } from '@/test/factories'
import { mockApi } from '@/test/mockApi'
import { logger } from '@/lib/logger'

describe('Error boundary', () => {
  it('shows a fallback, reports the error, and the rest of the app still works', async () => {
    const report = vi.spyOn(logger, 'reportError').mockImplementation(() => ({}) as never)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) // Vue dev warning
    const { user, router } = await renderApp('/debug/error')

    expect(await screen.findByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Boom: this page throws on purpose' }),
      expect.objectContaining({ source: 'error-boundary' }),
    )
    // "Try again" re-renders the page: it throws again, so the fallback comes back
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()

    // Header (outside the boundary) is still alive
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Back to the board' }))
    await waitFor(() => expect(router.currentRoute.value.name).toBe('board'))
    expect(await screen.findByRole('heading', { name: 'Task Board' })).toBeInTheDocument()
    report.mockRestore()
    warn.mockRestore()
  })
})

describe('Toasts (provide/inject + Teleport)', () => {
  it('confirms a created task in a live region outside the app root', async () => {
    const { user } = await renderApp('/tasks/new')
    await user.type(screen.getByLabelText('Title'), 'Toast me')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    const region = document.querySelector('[aria-live="polite"][data-test="toasts"]')!
    await waitFor(() => expect(region).toHaveTextContent('Created “Toast me”'))
    // Teleported: a child of <body>, NOT inside the app's container
    expect(region.parentElement).toBe(document.body)

    await user.click(
      within(region as HTMLElement).getByRole('button', { name: 'Dismiss notification' }),
    )
    expect(region).toHaveTextContent('')
  })
})

describe('Confirm dialog', () => {
  async function editDirty() {
    mockApi.seed([buildTask({ id: 5, title: 'Draft me' })])
    const utils = await renderApp('/tasks/5/edit')
    await utils.user.type(await screen.findByDisplayValue('Draft me'), '!')
    return utils
  }

  it('moves focus into the dialog (non-destructive button first)', async () => {
    const { user } = await editDirty()
    await user.click(screen.getByRole('link', { name: /Board/ }))
    const dialog = await screen.findByRole('alertdialog')
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Keep editing' })).toHaveFocus(),
    )
  })

  it('Escape keeps you on the page', async () => {
    const { user, router } = await editDirty()
    await user.click(screen.getByRole('link', { name: /Board/ }))
    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(router.currentRoute.value.name).toBe('task-edit')
  })

  it('Discard leaves the page', async () => {
    const { user, router } = await editDirty()
    await user.click(screen.getByRole('link', { name: /Board/ }))
    await user.click(await screen.findByRole('button', { name: 'Discard' }))
    await waitFor(() => expect(router.currentRoute.value.name).toBe('board'))
  })
})

describe('KeepAlive', () => {
  it('the board keeps what you typed and the filter while you visit another page', async () => {
    const { user, router } = await renderApp('/')
    await screen.findByText(/remaining/)
    await user.type(screen.getByRole('textbox', { name: 'New task' }), 'half typed')
    await user.click(screen.getByRole('button', { name: 'done' }))

    await router.push('/playground')
    await screen.findByRole('heading', { name: 'Playground' })
    await router.push('/')

    expect(await screen.findByRole('textbox', { name: 'New task' })).toHaveValue('half typed')
    expect(screen.getByRole('button', { name: 'done' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('Route announcer (a11y)', () => {
  it('announces the new page title and moves focus to <main>', async () => {
    const { user } = await renderApp('/')
    await screen.findByText(/remaining/)
    await user.click(screen.getByRole('link', { name: '+ New task (full form)' }))

    const announcer = document.querySelector('[data-test="route-announcer"]')!
    await waitFor(() => expect(announcer).toHaveTextContent('New task · Task Board'))
    expect(screen.getByRole('main')).toHaveFocus()
  })
})
