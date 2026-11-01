import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskItem from '../TaskItem.vue'

const task = { id: 7, title: 'Write tests', done: false }

describe('TaskItem', () => {
  it('renders the task from props', () => {
    const wrapper = mount(TaskItem, { props: { task } })
    expect(wrapper.text()).toContain('Write tests')
    expect(wrapper.classes()).not.toContain('done')
  })

  it('emits toggle and remove with the id', async () => {
    const wrapper = mount(TaskItem, { props: { task } })
    await wrapper.get('input[type="checkbox"]').trigger('change')
    await wrapper.get('button').trigger('click')
    // emitted() ≈ expect(onToggle).toHaveBeenCalledWith(7) in RTL
    expect(wrapper.emitted('toggle')).toEqual([[7]])
    expect(wrapper.emitted('remove')).toEqual([[7]])
  })

  it('reacts to prop changes', async () => {
    const wrapper = mount(TaskItem, { props: { task } })
    await wrapper.setProps({ task: { ...task, done: true } })
    expect(wrapper.classes()).toContain('done')
  })
})
