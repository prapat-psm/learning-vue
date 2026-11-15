import { expect, test } from '@playwright/test'

/**
 * Same locator ideas as Testing Library (getByRole, getByLabel), so the skills transfer.
 * Playwright auto-waits: expect(...).toBeVisible() retries until it passes or times out.
 */
test('create → view → edit → toggle → delete a task', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Learn TanStack Query' })).toBeVisible()

  // Create with the full form
  await page.getByRole('link', { name: '+ New task (full form)' }).click()
  await page.getByLabel('Title').fill('Ship step 08')
  await page.getByLabel('Priority').selectOption('high')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/tasks\/\d+$/)
  await expect(page.getByRole('heading', { name: 'Ship step 08' })).toBeVisible()

  // Edit
  await page.getByRole('link', { name: 'Edit' }).click()
  await page.getByLabel('Title').fill('Ship step 08 today')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('heading', { name: 'Ship step 08 today' })).toBeVisible()

  // Toggle on the board, survives a reload (the mock "server" persisted it)
  await page.getByRole('link', { name: '← Back' }).click()
  // Optimistic UI = the checkbox is checked BEFORE the server saved it. Reloading right away
  // would lose the change (a real race this test found!). So wait for the PATCH response.
  const saved = page.waitForResponse(
    (res) => res.request().method() === 'PATCH' && res.url().includes('/api/tasks/'),
  )
  await page.getByRole('checkbox', { name: 'Toggle Ship step 08 today' }).check()
  await saved
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Toggle Ship step 08 today' })).toBeChecked()

  // Delete
  await page.getByRole('button', { name: 'Remove Ship step 08 today' }).click()
  await expect(page.getByRole('link', { name: 'Ship step 08 today' })).toHaveCount(0)
})

test('duplicate title shows the server error in the field', async ({ page }) => {
  await page.goto('/tasks/new')
  await page.getByLabel('Title').fill('learn tanstack query')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByRole('alert')).toHaveText('A task with this title already exists')
  await expect(page.getByLabel('Title')).toHaveAttribute('aria-invalid', 'true')
})

test('unknown task shows 404, playground shows older steps', async ({ page }) => {
  await page.goto('/tasks/999')
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()

  await page.goto('/playground/07')
  await expect(page.getByRole('navigation', { name: 'Steps' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Task Board' })).toBeVisible()
})
