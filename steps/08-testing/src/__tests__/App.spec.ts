import { afterEach, describe, expect, it, vi } from 'vitest'
import { type VueWrapper } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/node'
import { db } from '@/mocks/db'
import { mountApp } from '@/test/mountApp'
import { settle } from '@/test/settle'

/**
 * Integration tests: real router + Pinia + QueryClient, network mocked by MSW.
 * `await settle()` waits for requests + re-renders (≈ RTL's findBy* / waitFor).
 */
let wrapper: VueWrapper
afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

describe('Board (TanStack Query + MSW)', () => {
  it('adds, toggles and removes tasks through the API', async () => {
    ;({ wrapper } = await mountApp('/'))
    await settle()
    const remaining = () => wrapper.get('[data-test="remaining"]').text()
    expect(remaining()).toContain('2 remaining')

    await wrapper.get('input[aria-label="New task"]').setValue('Write tests')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(wrapper.findAll('li')).toHaveLength(4)
    expect(db.all().map((t) => t.title)).toContain('Write tests') // really on the "server"

    await wrapper.get('input[aria-label="Toggle Write tests"]').trigger('change')
    await settle()
    expect(remaining()).toContain('2 remaining')
    expect(db.all().find((t) => t.title === 'Write tests')?.done).toBe(true)

    await wrapper.get('button[aria-label="Remove Write tests"]').trigger('click')
    await settle()
    expect(wrapper.findAll('li')).toHaveLength(3)
  })

  it('header badge and board share one cached query', async () => {
    ;({ wrapper } = await mountApp('/'))
    await settle()
    expect(wrapper.get('[data-test="header-remaining"]').text()).toBe('2')
    await wrapper.get('input[aria-label="Toggle Learn TanStack Query"]').trigger('change')
    await settle()
    expect(wrapper.get('[data-test="header-remaining"]').text()).toBe('1')
  })

  it('clear completed deletes done tasks on the server', async () => {
    ;({ wrapper } = await mountApp('/'))
    await settle()
    const clear = wrapper.findAll('button').find((b) => b.text() === 'Clear completed')!
    await clear.trigger('click')
    await settle()
    expect(db.all().some((t) => t.done)).toBe(false)
    expect(wrapper.findAll('li')).toHaveLength(2)
  })
})

describe('Task detail (hand-rolled useFetch)', () => {
  it('opens from the board, toggles, deletes and goes back', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/'))
    await settle()
    await wrapper.get('a[href="/tasks/2"]').trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('task'))
    await settle()
    expect(wrapper.get('h1').text()).toBe('Learn TanStack Query')

    await wrapper
      .findAll('button')
      .find((b) => b.text().startsWith('Mark as'))!
      .trigger('click')
    await settle()
    expect(wrapper.get('[data-test="status"]').text()).toBe('Status: Done')

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Delete')!
      .trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('board'))
    await settle()
    expect(wrapper.text()).not.toContain('Learn TanStack Query')
  })

  it('shows a 404 from the API response', async () => {
    ;({ wrapper } = await mountApp('/tasks/999'))
    await settle()
    expect(wrapper.get('h1').text()).toBe('404')
  })

  it('shows a retryable error on a 500', async () => {
    server.use(
      http.get('*/api/tasks/2', () => HttpResponse.json({ message: 'Oops' }, { status: 500 }), {
        once: true,
      }),
    )
    ;({ wrapper } = await mountApp('/tasks/2'))
    await settle()
    expect(wrapper.get('[data-test="load-error"]').text()).toContain('Oops')
    await wrapper.get('[data-test="load-error"] button').trigger('click')
    await settle()
    expect(wrapper.get('h1').text()).toBe('Learn TanStack Query')
  })

  it('param regex still rejects non-numeric ids', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/tasks/abc'))
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})

describe('Forms + API', () => {
  it('creates a task and opens its detail page', async () => {
    let router
    ;({ wrapper, router } = await mountApp('/tasks/new'))
    await settle()
    await wrapper.get('input[name="title"]').setValue('Read TanStack docs')
    await wrapper.get('select').setValue('high')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('task'))
    await settle()
    expect(wrapper.get('h1').text()).toBe('Read TanStack docs')
    expect(wrapper.get('[data-test="priority"]').text()).toBe('high')
  })

  it('maps a 422 from the server into the title field', async () => {
    ;({ wrapper } = await mountApp('/tasks/new'))
    await settle()
    await wrapper.get('input[name="title"]').setValue('learn tanstack query')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(wrapper.get('#title-error').text()).toBe('A task with this title already exists')
  })

  it('loads the task into the edit form, saves, and shows the new title', async () => {
    const confirm = vi.spyOn(window, 'confirm')
    let router
    ;({ wrapper, router } = await mountApp('/tasks/2/edit'))
    await settle()
    const input = () => wrapper.get('input[name="title"]').element as HTMLInputElement
    expect(input().value).toBe('Learn TanStack Query')

    await wrapper.get('input[name="title"]').setValue('Learn TanStack Query well')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('task'))
    await settle()
    expect(wrapper.get('h1').text()).toBe('Learn TanStack Query well')
    expect(confirm).not.toHaveBeenCalled()
  })

  it('edit of an unknown task shows the API 404', async () => {
    ;({ wrapper } = await mountApp('/tasks/999/edit'))
    await settle()
    expect(wrapper.get('[data-test="load-error"]').text()).toBe('Task 999 does not exist.')
  })
})

describe('Playground', () => {
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
      '06 · Forms',
      '07 · API',
    ])
  })

  it.each([
    ['01', 'Learn v-for & v-model'],
    ['02', 'Learn props & emits'],
    ['03', 'Learn composables'],
    ['04', 'Learn composables'],
    ['05', 'Learn forms'], // 05 and 06 share step 06's store (see playground/steps.ts)
    ['06', 'Learn forms'],
    ['07', 'Learn TanStack Query'], // 07 board reads the same mock API
  ])('renders step %s inside the layout', async (id, text) => {
    localStorage.clear()
    ;({ wrapper } = await mountApp(`/playground/${id}`))
    await settle() // 07 fetches from the API
    expect(wrapper.get('.stage').text()).toContain(text)
  })
})
