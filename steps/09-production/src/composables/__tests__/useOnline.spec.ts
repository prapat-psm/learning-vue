import { describe, expect, it } from 'vitest'
import { useOnline } from '../useOnline'
import { withSetup } from '@/test/withSetup'

describe('useOnline', () => {
  it('follows online/offline events and cleans up on unmount', () => {
    const [isOnline, app] = withSetup(() => useOnline())
    window.dispatchEvent(new Event('offline'))
    expect(isOnline.value).toBe(false)
    window.dispatchEvent(new Event('online'))
    expect(isOnline.value).toBe(true)

    app.unmount() // onUnmounted removes the listeners
    window.dispatchEvent(new Event('offline'))
    expect(isOnline.value).toBe(true)
  })
})
