import { flushPromises } from '@vue/test-utils'

/**
 * VeeValidate runs validation in a later macrotask, so flushPromises() alone is not enough.
 * Wait a few ticks until the form has settled. (RTL equivalent: waitFor / findBy*)
 */
export async function settle(rounds = 3) {
  for (let i = 0; i < rounds; i++) {
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}
