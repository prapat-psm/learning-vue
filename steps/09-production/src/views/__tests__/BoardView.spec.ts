import { afterEach, describe, expect, it } from 'vitest'
import { mount, RouterLinkStub, type VueWrapper } from '@vue/test-utils'
import { settle } from '@/test/settle'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/node'
import { createTestQueryClient } from '@/test/mountApp'
import BoardView from '../BoardView.vue'

/**
 * Component test with a REAL QueryClient and a mocked network (MSW).
 * We don't mock useQuery: we control what the "server" answers. Same idea as RTL + MSW in React.
 */
let wrapper: VueWrapper
afterEach(() => wrapper?.unmount())

function mountBoard() {
  wrapper = mount(BoardView, {
    global: {
      plugins: [createPinia(), [VueQueryPlugin, { queryClient: createTestQueryClient() }]],
      stubs: { RouterLink: RouterLinkStub },
    },
  })
  return wrapper
}

describe('BoardView (server state)', () => {
  it('shows loading, then the tasks', async () => {
    mountBoard()
    expect(wrapper.find('[data-test="loading"]').exists()).toBe(true)
    await settle()
    expect(wrapper.find('[data-test="loading"]').exists()).toBe(false)
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.get('[data-test="remaining"]').text()).toContain('2 remaining')
  })

  it('shows an error with Retry, and Retry recovers', async () => {
    server.use(
      http.get(
        '*/api/tasks',
        () => HttpResponse.json({ message: 'Server down' }, { status: 500 }),
        { once: true },
      ),
    )
    mountBoard()
    await settle()
    expect(wrapper.get('[data-test="load-error"]').text()).toContain('Server down')

    await wrapper.get('[data-test="load-error"] button').trigger('click') // next call hits the normal handler
    await settle()
    await settle()
    expect(wrapper.findAll('li')).toHaveLength(3)
  })

  it('shows the server validation error from quick add', async () => {
    mountBoard()
    await settle()
    await wrapper.get('input[aria-label="New task"]').setValue('Learn TanStack Query')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(wrapper.get('[data-test="create-error"]').text()).toBe(
      'A task with this title already exists',
    )
  })
})
