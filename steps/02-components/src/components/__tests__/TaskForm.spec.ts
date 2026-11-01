import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskForm from '../TaskForm.vue'

describe('TaskForm', () => {
  it('emits trimmed title and clears the input', async () => {
    const wrapper = mount(TaskForm)
    const input = wrapper.get('input')
    await input.setValue('  New one  ')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('add')).toEqual([['New one']])
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('does not emit on empty input', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('add')).toBeUndefined()
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })
})
