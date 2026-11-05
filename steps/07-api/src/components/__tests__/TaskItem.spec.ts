import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import TaskItem from '../TaskItem.vue'

const task = { id: 7, title: 'Write tests', done: false }
// No router in a unit test: replace <RouterLink> with a stub that records its `to` prop
const global = { stubs: { RouterLink: RouterLinkStub } }

describe('TaskItem', () => {
  it('renders the task and links to its detail page', () => {
    const wrapper = mount(TaskItem, { props: { task }, global })
    expect(wrapper.text()).toContain('Write tests')
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toEqual({
      name: 'task',
      params: { id: 7 },
    })
  })

  it('emits toggle and remove with the id', async () => {
    const wrapper = mount(TaskItem, { props: { task }, global })
    await wrapper.get('input[type="checkbox"]').trigger('change')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([[7]])
    expect(wrapper.emitted('remove')).toEqual([[7]])
  })

  it('reacts to prop changes', async () => {
    const wrapper = mount(TaskItem, { props: { task }, global })
    await wrapper.setProps({ task: { ...task, done: true } })
    expect(wrapper.classes()).toContain('done')
  })
})
