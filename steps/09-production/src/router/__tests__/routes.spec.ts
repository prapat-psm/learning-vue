import { describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createAppRouter } from '../index'
import { taskKeys } from '@/queries/tasks'

/**
 * Pure unit tests: no component is mounted. router.resolve() only matches the URL.
 * Fast, and they pin down the URL contract (bookmarks and shared links depend on it).
 */
const router = createAppRouter(createMemoryHistory())

describe('route table', () => {
  it.each([
    ['/', 'board'],
    ['/tasks/new', 'task-new'],
    ['/tasks/42', 'task'],
    ['/tasks/42/edit', 'task-edit'],
    ['/playground/03', 'playground-03'],
    ['/tasks/abc', 'not-found'],
    ['/nope/deep/path', 'not-found'],
  ])('%s → %s', (path, name) => {
    expect(router.resolve(path).name).toBe(name)
  })

  it('turns the :id param into a number prop', () => {
    const route = router.resolve('/tasks/42')
    const props = route.matched[0]!.props.default as (r: typeof route) => unknown
    expect(props(route)).toEqual({ id: 42 })
  })

  it('builds URLs from names (never hard-code paths in links)', () => {
    expect(router.resolve({ name: 'task-edit', params: { id: 7 } }).href).toBe('/tasks/7/edit')
  })
})

describe('query keys', () => {
  // Inline snapshot: good for small, stable values. Avoid big DOM snapshots (they get rubber-stamped).
  it('are hierarchical so invalidating ["tasks"] hits everything', () => {
    expect([taskKeys.list(), taskKeys.detail(3)]).toMatchInlineSnapshot(`
      [
        [
          "tasks",
          "list",
        ],
        [
          "tasks",
          "detail",
          3,
        ],
      ]
    `)
  })
})
