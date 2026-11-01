import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from '../TaskList.vue'
import TaskItem from '../TaskItem.vue'

describe('TaskList', () => {
  it('renders one TaskItem per task', () => {
    const tasks = [
      { id: 1, title: 'A', done: false },
      { id: 2, title: 'B', done: true },
    ]
    const wrapper = mount(TaskList, { props: { tasks } })
    expect(wrapper.findAllComponents(TaskItem)).toHaveLength(2)
  })

  it('re-emits child events', async () => {
    const wrapper = mount(TaskList, { props: { tasks: [{ id: 1, title: 'A', done: false }] } })
    wrapper.findComponent(TaskItem).vm.$emit('remove', 1)
    expect(wrapper.emitted('remove')).toEqual([[1]])
  })

  it('shows fallback or custom empty slot', () => {
    expect(mount(TaskList, { props: { tasks: [] } }).text()).toBe('No tasks')
    const custom = mount(TaskList, {
      props: { tasks: [] },
      slots: { empty: '<p>Nothing here</p>' },
    })
    expect(custom.text()).toBe('Nothing here')
  })
})
