import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskForm from '../TaskForm.vue'

describe('TaskForm (hand-rolled validation)', () => {
  it('emits trimmed title and clears the input', async () => {
    const wrapper = mount(TaskForm)
    const input = wrapper.get('input')
    await input.setValue('  New one  ')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('add')).toEqual([['New one']])
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('disables submit on empty input', async () => {
    const wrapper = mount(TaskForm)
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('shows the schema error only after submit, then clears it when fixed', async () => {
    const wrapper = mount(TaskForm)
    const input = wrapper.get('input')
    await input.setValue('ab')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[role="alert"]').text()).toBe('Title needs at least 3 characters')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('add')).toBeUndefined()

    await input.setValue('abc')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})
