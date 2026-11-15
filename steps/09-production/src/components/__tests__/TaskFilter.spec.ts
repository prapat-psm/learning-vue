import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskFilter from '../TaskFilter.vue'

describe('TaskFilter', () => {
  it('emits update:modelValue (that is what v-model listens to)', async () => {
    const wrapper = mount(TaskFilter, { props: { modelValue: 'all' } })
    await wrapper.get('button:nth-child(2)').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['active']])
  })
})
