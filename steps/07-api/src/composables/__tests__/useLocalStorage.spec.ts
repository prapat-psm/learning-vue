import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns the initial value when nothing is stored', () => {
    expect(useLocalStorage('k', 5).value).toBe(5)
  })

  it('reads an existing value', () => {
    localStorage.setItem('k', JSON.stringify({ a: 1 }))
    expect(useLocalStorage('k', {}).value).toEqual({ a: 1 })
  })

  it('writes on change, including deep changes', async () => {
    const state = useLocalStorage('k', { items: [] as number[] })
    state.value.items.push(1)
    await nextTick() // watchers run asynchronously, before the next render
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual({ items: [1] })
  })

  it('falls back to initial on corrupted JSON', () => {
    localStorage.setItem('k', '{not json')
    expect(useLocalStorage('k', 'fallback').value).toBe('fallback')
  })
})

describe('useLocalStorage initial value', () => {
  beforeEach(() => localStorage.clear())

  it('does not mutate the initial object (regression)', () => {
    const initial = [1]
    useLocalStorage('k', initial).value.push(2)
    expect(initial).toEqual([1])
  })
})
