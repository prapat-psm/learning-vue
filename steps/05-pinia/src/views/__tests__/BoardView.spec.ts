import { describe, expect, it, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import BoardView from '../BoardView.vue'
import { useTasksStore } from '@/stores/tasks'

/**
 * createTestingPinia: a fake store for COMPONENT tests.
 * - initialState sets the state directly (≈ mocking a Zustand store / Context value)
 * - actions are replaced by vi.fn() spies, so we test "the view calls the store", not the store logic
 */
function mountBoard() {
  const wrapper = mount(BoardView, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            tasks: {
              tasks: [
                { id: 1, title: 'From initialState', done: false },
                { id: 2, title: 'Second', done: true },
              ],
            },
          },
        }),
      ],
      stubs: { RouterLink: RouterLinkStub },
    },
  })
  return { wrapper, store: useTasksStore() }
}

describe('BoardView with a testing pinia', () => {
  it('renders state and getters from the store', () => {
    const { wrapper } = mountBoard()
    expect(wrapper.text()).toContain('From initialState')
    expect(wrapper.get('[data-test="remaining"]').text()).toBe('1 remaining')
  })

  it('calls store actions (stubbed) on user events', async () => {
    const { wrapper, store } = mountBoard()
    await wrapper.get('input[aria-label="New task"]').setValue('Spy me')
    await wrapper.get('form').trigger('submit')
    expect(store.addTask).toHaveBeenCalledWith('Spy me')

    const clear = wrapper.findAll('button').find((b) => b.text() === 'Clear completed')!
    await clear.trigger('click')
    expect(store.clearCompleted).toHaveBeenCalledOnce()

    // Stubbed = nothing really changed
    expect(store.tasks).toHaveLength(2)
  })

  it('re-renders when state is changed from outside', async () => {
    const { wrapper, store } = mountBoard()
    store.tasks[0]!.done = true
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-test="remaining"]').text()).toBe('0 remaining')
  })
})
