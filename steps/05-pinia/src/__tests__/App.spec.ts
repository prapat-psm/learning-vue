import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper
beforeEach(() => localStorage.clear())
afterEach(() => wrapper?.unmount())

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
    expect(wrapper.get('h1').text()).toBe('Learn Pinia')
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
    expect(wrapper.text()).not.toContain('Learn Pinia')
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
    ])
  })

  it.each([
    ['01', 'Learn v-for & v-model'],
    ['02', 'Learn props & emits'],
    ['03', 'Learn composables'],
    ['04', 'Learn composables'], // step 04 board: its own useTasks() defaults
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
