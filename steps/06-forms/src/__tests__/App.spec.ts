import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { mountApp } from '@/test/mountApp'
import { settle } from '@/test/settle'

let wrapper: VueWrapper
beforeEach(() => localStorage.clear())
afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

describe('Board route', () => {
  it('adds, toggles and removes tasks', async () => {
    ;({ wrapper } = await mountApp('/'))
    const remaining = () => wrapper.get('[data-test="remaining"]').text()
    expect(remaining()).toBe('1 remaining')

    await wrapper.get('input[aria-label="New task"]').setValue('Write tests')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.findAll('li')).toHaveLength(3)

    await wrapper.get('input[aria-label="Toggle Write tests"]').trigger('change')
    expect(remaining()).toBe('1 remaining')

    await wrapper.get('button[aria-label="Remove Write tests"]').trigger('click')
    expect(wrapper.findAll('li')).toHaveLength(2)
  })
})

describe('Shared state (Pinia)', () => {
  it('header badge follows the board, a different component', async () => {
    ;({ wrapper } = await mountApp('/'))
    const badge = () => wrapper.get('[data-test="header-remaining"]').text()
    expect(badge()).toBe('1')
    await wrapper.get('input[aria-label="New task"]').setValue('Another')
    await wrapper.get('form').trigger('submit')
    expect(badge()).toBe('2')
  })

  it('a change on the detail page shows on the board without reload', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/tasks/2'))
    await wrapper.get('button').trigger('click') // mark as done
    await router.push('/')
    await flushPromises()
    expect(wrapper.get('[data-test="remaining"]').text()).toBe('0 remaining')
    expect(wrapper.get('[data-test="header-remaining"]').text()).toBe('0')
  })
})

describe('Task detail route', () => {
  it('opens from the board link and reads the :id param', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/'))
    await wrapper.get('a[href="/tasks/2"]').trigger('click')
    // Navigation is async (guards + lazy chunk download), so wait for it
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('task'))
    await flushPromises()
    expect(wrapper.get('h1').text()).toBe('Learn forms')
    expect(wrapper.get('[data-test="status"]').text()).toBe('Status: Active')
  })

  it('toggles and deletes, then navigates back to the board', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/tasks/2'))
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('[data-test="status"]').text()).toBe('Status: Done')

    const del = wrapper.findAll('button').find((b) => b.text() === 'Delete')!
    await del.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('board')
    expect(wrapper.text()).not.toContain('Learn forms')
  })

  it('guard redirects a missing task to 404 and keeps the URL', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/tasks/999'))
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(router.currentRoute.value.path).toBe('/tasks/999')
    expect(wrapper.get('h1').text()).toBe('404')
  })

  it('param regex rejects non-numeric ids', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/tasks/abc'))
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})

describe('Playground (nested + lazy routes)', () => {
  it('lists every earlier step', async () => {
    ;({ wrapper } = await mountApp('/playground'))
    const links = wrapper.findAll('nav[aria-label="Steps"] a').map((a) => a.text())
    expect(links).toEqual([
      'Overview',
      '01 · Reactivity',
      '02 · Components',
      '03 · Composables',
      '04 · Router',
      '05 · Pinia',
    ])
  })

  it.each([
    ['01', 'Learn v-for & v-model'],
    ['02', 'Learn props & emits'],
    ['03', 'Learn composables'],
    ['04', 'Learn composables'], // step 04 board: its own useTasks() defaults
    ['05', 'Learn forms'], // step 05 board gets OUR store (same id), so our defaults
  ])('renders step %s inside the layout', async (id, text) => {
    ;({ wrapper } = await mountApp(`/playground/${id}`))
    expect(wrapper.find('nav[aria-label="Steps"]').exists()).toBe(true) // layout kept
    expect(wrapper.get('.stage').text()).toContain(text) // child rendered in nested RouterView
  })

  it('sets the document title from route meta', async () => {
    ;({ wrapper } = await mountApp('/playground/02'))
    expect(document.title).toBe('Step 02 · Task Board')
  })
})

describe('Forms (step 06)', () => {
  it('creates a task from /tasks/new and opens its detail page', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/'))
    await wrapper.get('a[href="/tasks/new"]').trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('task-new'))
    await settle()

    await wrapper.get('input[name="title"]').setValue('Read VeeValidate docs')
    await wrapper.get('select').setValue('high')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('task'))
    await settle()
    expect(wrapper.get('h1').text()).toBe('Read VeeValidate docs')
    expect(wrapper.get('[data-test="priority"]').text()).toBe('high')
  })

  it('rejects a duplicate title with a field error (server-side rule)', async () => {
    ;({ wrapper } = await mountApp('/tasks/new'))
    await wrapper.get('input[name="title"]').setValue('learn forms')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(wrapper.get('#title-error').text()).toBe('A task with this title already exists')
  })

  it('edits a task and saves without the leave warning', async () => {
    const confirm = vi.spyOn(window, 'confirm')
    let router
    ;({ wrapper, router } = await mountApp('/tasks/2/edit'))
    expect((wrapper.get('input[name="title"]').element as HTMLInputElement).value).toBe(
      'Learn forms',
    )

    await wrapper.get('input[name="title"]').setValue('Learn forms well')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('task'))
    await settle()
    expect(wrapper.get('h1').text()).toBe('Learn forms well')
    expect(confirm).not.toHaveBeenCalled()
  })

  it('asks before leaving with unsaved changes, and stays if you cancel', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    let router
    ;({ wrapper, router } = await mountApp('/tasks/2/edit'))
    await wrapper.get('input[name="title"]').setValue('Half typed')
    await settle()

    await router.push('/')
    expect(confirm).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.name).toBe('task-edit')

    confirm.mockReturnValue(true)
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('board')
  })

  it('unknown task edit → 404', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/tasks/999/edit'))
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
