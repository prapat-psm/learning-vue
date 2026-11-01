import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

// mount() ≈ render() from @testing-library/react
describe('App (step 1)', () => {
  it('renders initial tasks and remaining count', () => {
    const wrapper = mount(App)
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.get('[data-test="remaining"]').text()).toBe('1 remaining')
  })

  it('adds a task via v-model + submit', async () => {
    const wrapper = mount(App)
    await wrapper.get('input[aria-label="New task"]').setValue('Write tests')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.text()).toContain('Write tests')
    expect(wrapper.get('[data-test="remaining"]').text()).toBe('2 remaining')
  })

  it('toggles and removes a task', async () => {
    const wrapper = mount(App)
    await wrapper.findAll('input[type="checkbox"]')[1]!.setValue(true)
    expect(wrapper.get('[data-test="remaining"]').text()).toBe('0 remaining')
    await wrapper.findAll('li button')[0]!.trigger('click')
    expect(wrapper.findAll('li')).toHaveLength(1)
  })

  it('shows empty state', async () => {
    const wrapper = mount(App)
    for (const btn of wrapper.findAll('li button')) await btn.trigger('click')
    expect(wrapper.text()).toContain('No tasks yet')
  })
})
