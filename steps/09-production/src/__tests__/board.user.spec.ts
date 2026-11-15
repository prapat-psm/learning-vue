import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/vue'
import { renderApp } from '@/test/render'
import { buildTask } from '@/test/factories'
import { mockApi } from '@/test/mockApi'

/**
 * STEP 08: Testing Library style. Compare with App.spec.ts (Vue Test Utils style).
 * Rules (same as React Testing Library):
 *   1. Query like a user: getByRole / getByLabelText / getByText. Not CSS classes or data-test.
 *   2. Act like a user: user.type / user.click (focus, keydown, input, change... all fire).
 *   3. Wait for the UI, not for implementation: findBy* / waitFor.
 */

describe('Board as a user sees it', () => {
  it('shows a loading status, then the tasks from the API', async () => {
    mockApi.seed([buildTask({ title: 'Buy milk' }), buildTask({ title: 'Walk dog', done: true })])
    await renderApp('/')

    expect(screen.getByRole('status')).toHaveTextContent('Loading tasks…')
    // findBy* = getBy* + waitFor. Use it for anything that appears after a request.
    expect(await screen.findByRole('link', { name: 'Buy milk' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Toggle Walk dog' })).toBeChecked()
    expect(screen.getByText(/1 remaining/)).toBeInTheDocument()
  })

  it('adds a task with the keyboard only (Enter submits)', async () => {
    const { user } = await renderApp('/')
    await screen.findByText(/remaining/)

    await user.type(
      screen.getByRole('textbox', { name: 'New task' }),
      'Learn Testing Library{Enter}',
    )

    expect(await screen.findByRole('link', { name: 'Learn Testing Library' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'New task' })).toHaveValue('') // form was reset
  })

  it('shows the quick-add rule error and does not call the API', async () => {
    const calls = mockApi.record()
    const { user } = await renderApp('/')
    await screen.findByText(/remaining/)

    await user.type(screen.getByRole('textbox', { name: 'New task' }), 'ab')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Title needs at least 3 characters')
    expect(calls.filter((c) => c.method === 'POST')).toHaveLength(0)
  })

  it('filters with the filter buttons (aria-pressed)', async () => {
    mockApi.seed([buildTask({ title: 'Open one' }), buildTask({ title: 'Closed one', done: true })])
    const { user } = await renderApp('/')
    await screen.findByText('Open one')

    const filters = screen.getByRole('group', { name: 'Filter tasks' })
    await user.click(within(filters).getByRole('button', { name: 'done' }))

    expect(within(filters).getByRole('button', { name: 'done' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByText('Open one')).not.toBeInTheDocument() // queryBy* → null instead of throwing
    expect(screen.getByText('Closed one')).toBeInTheDocument()
  })

  it('shows the empty state', async () => {
    mockApi.seed([])
    await renderApp('/')
    expect(await screen.findByText('No tasks yet 🎉')).toBeInTheDocument()
  })
})

describe('Board when the server misbehaves', () => {
  it('rolls back a failed toggle and tells the user', async () => {
    mockApi.seed([buildTask({ title: 'Fragile' })])
    mockApi.fail('patch', '/tasks/:id', 500)
    const { user } = await renderApp('/')
    const checkbox = await screen.findByRole('checkbox', { name: 'Toggle Fragile' })

    await user.click(checkbox)

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save your change')
    await waitFor(() => expect(checkbox).not.toBeChecked()) // optimistic change undone
  })

  it('rolls back a failed delete', async () => {
    mockApi.seed([buildTask({ title: 'Keep me' })])
    mockApi.fail('delete', '/tasks/:id', 503)
    const { user } = await renderApp('/')
    await user.click(await screen.findByRole('button', { name: 'Remove Keep me' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error 503')
    expect(screen.getByRole('link', { name: 'Keep me' })).toBeInTheDocument()
  })

  it('network error on load → error with Retry that recovers', async () => {
    mockApi.networkError('get', '/tasks')
    const { user } = await renderApp('/')
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load tasks')

    mockApi.seed([buildTask({ title: 'Back online' })])
    // server.use() handlers stack; resetHandlers() drops the override → the normal handler answers
    const { server } = await import('@/mocks/node')
    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('link', { name: 'Back online' })).toBeInTheDocument()
  })

  it('keeps showing "Loading" while the request hangs', async () => {
    mockApi.hang('get', '/tasks')
    await renderApp('/')
    await new Promise((r) => setTimeout(r, 50))
    expect(screen.getByRole('status')).toHaveTextContent('Loading tasks…')
  })
})

describe('Full form flow (VeeValidate + API)', () => {
  it('creates a task, then lands on its page', async () => {
    const calls = mockApi.record()
    const { user, router } = await renderApp('/tasks/new')

    await user.type(screen.getByLabelText('Title'), 'Write e2e tests')
    await user.selectOptions(screen.getByLabelText('Priority'), 'high')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByRole('heading', { name: 'Write e2e tests' })).toBeInTheDocument()
    expect(router.currentRoute.value.name).toBe('task')
    // Assert the CONTRACT with the server, not just the UI
    expect(calls.find((c) => c.method === 'POST')?.body).toMatchObject({
      title: 'Write e2e tests',
      priority: 'high',
    })
  })

  it('shows the field error after blur, not while typing', async () => {
    const { user } = await renderApp('/tasks/new')
    const title = screen.getByLabelText('Title')

    await user.type(title, 'ab')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument() // no shouting mid-typing

    await user.tab() // blur
    expect(await screen.findByRole('alert')).toHaveTextContent('Title needs at least 3 characters')
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Title needs at least 3 characters')
  })

  it('asks before leaving an edited form (in-app dialog, step 09)', async () => {
    mockApi.seed([buildTask({ id: 5, title: 'Draft me' })])
    const { user, router } = await renderApp('/tasks/5/edit')

    await user.type(await screen.findByDisplayValue('Draft me'), ' more')
    await user.click(screen.getByRole('link', { name: /Board/ }))

    // The dialog is teleported to <body>. screen queries the whole body, so it just works.
    const dialog = await screen.findByRole('alertdialog', { name: 'Discard unsaved changes?' })
    await user.click(within(dialog).getByRole('button', { name: 'Keep editing' }))

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(router.currentRoute.value.name).toBe('task-edit')
  })
})
