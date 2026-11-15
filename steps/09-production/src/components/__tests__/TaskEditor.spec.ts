import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { settle } from '@/test/settle'
import TaskEditor from '../TaskEditor.vue'

// VeeValidate validates asynchronously → await settle() after actions
describe('TaskEditor (VeeValidate + Zod)', () => {
  it('shows schema errors on submit and does not emit', async () => {
    const wrapper = mount(TaskEditor)
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(wrapper.get('#title-error').text()).toBe('Title needs at least 3 characters')
    expect(wrapper.get('input[name="title"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('validates on blur, not while typing', async () => {
    const wrapper = mount(TaskEditor)
    const input = wrapper.get('input[name="title"]')
    // Real typing fires only `input` events (setValue() would also fire `change`)
    ;(input.element as HTMLInputElement).value = 'ab'
    await input.trigger('input')
    await settle()
    expect(wrapper.find('#title-error').exists()).toBe(false) // typing: quiet
    await input.trigger('blur')
    await settle()
    expect(wrapper.find('#title-error').exists()).toBe(true) // blur: validate
  })

  it('emits typed, trimmed values', async () => {
    const wrapper = mount(TaskEditor)
    await wrapper.get('input[name="title"]').setValue('  Ship step 6  ')
    await wrapper.get('textarea').setValue('Forms')
    await wrapper.get('select').setValue('high')
    await wrapper.get('form').trigger('submit')
    await settle()
    const [values] = wrapper.emitted<[unknown]>('submit')![0]!
    expect(values).toEqual({ title: 'Ship step 6', description: 'Forms', priority: 'high' })
  })

  it('pre-fills initial values and tracks dirty via v-model:dirty', async () => {
    const wrapper = mount(TaskEditor, {
      props: { initialValues: { title: 'Existing', priority: 'low' } },
    })
    expect((wrapper.get('input[name="title"]').element as HTMLInputElement).value).toBe('Existing')
    expect(wrapper.find('[data-test="dirty"]').exists()).toBe(false)

    await wrapper.get('input[name="title"]').setValue('Changed')
    await settle()
    expect(wrapper.find('[data-test="dirty"]').exists()).toBe(true)
    const dirtyEvents = wrapper.emitted('update:dirty')!
    expect(dirtyEvents[dirtyEvents.length - 1]).toEqual([true])
  })

  it('lets the parent push a server-side error into a field', async () => {
    const wrapper = mount(TaskEditor, {
      props: {
        onSubmit: (
          _values: unknown,
          { setFieldError }: { setFieldError: (f: 'title', m: string) => void },
        ) => setFieldError('title', 'Taken'),
      },
    })
    await wrapper.get('input[name="title"]').setValue('Duplicate')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(wrapper.get('#title-error').text()).toBe('Taken')
  })
})
