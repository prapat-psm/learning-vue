import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App (step 3)', () => {
  beforeEach(() => localStorage.clear())

  it('adds, toggles and removes tasks', async () => {
    const wrapper = mount(App)
    const remaining = () => wrapper.get('[data-test="remaining"]').text()
    expect(remaining()).toBe('1 remaining')

    await wrapper.get('input[aria-label="New task"]').setValue('Write tests')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(remaining()).toBe('2 remaining')

    await wrapper.findAll('input[type="checkbox"]')[1]!.trigger('change')
    expect(remaining()).toBe('1 remaining')

    await wrapper.get('button[aria-label="Remove Write tests"]').trigger('click')
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('filters and clears completed', async () => {
    const wrapper = mount(App)
    await wrapper.get('[aria-label="Filter tasks"] button:nth-child(3)').trigger('click')
    expect(wrapper.findAll('li')).toHaveLength(1)
    const clear = wrapper.findAll('button').find((b) => b.text() === 'Clear completed')!
    await clear.trigger('click')
    expect(wrapper.text()).toContain('No tasks yet')
  })

  it('keeps tasks after remount (localStorage)', async () => {
    const first = mount(App)
    await first.get('input[aria-label="New task"]').setValue('Persist me')
    await first.get('form').trigger('submit')
    first.unmount()
    expect(mount(App).text()).toContain('Persist me')
  })
})
