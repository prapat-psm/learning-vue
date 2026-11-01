import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

// Integration test: real children, same assertions as step 1.
// Proves the refactor into components kept behavior identical.
describe('App (step 2)', () => {
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

  it('shows custom empty slot', async () => {
    const wrapper = mount(App)
    for (const btn of wrapper.findAll('li button')) await btn.trigger('click')
    expect(wrapper.text()).toContain('No tasks yet')
  })
})
