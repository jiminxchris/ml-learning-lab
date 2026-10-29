import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const base = process.env.QA_URL || 'http://127.0.0.1:5174/';
const browser = await chromium.launch({ channel: 'chrome' }),
  page = await browser.newPage({ viewport: { width: 1512, height: 1000 } }),
  errors = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.goto(base + '#/lesson/linear/lab');
  const mse = () =>
    page.locator('.stats .stat').first().locator('strong').textContent().then(Number);
  const before = await mse();
  await page.getByRole('button', { name: '한 단계 진행', exact: true }).click();
  assert.ok((await mse()) < before);
  await page.locator('.history-strip').waitFor();
  const path = page.locator('.prediction-line'),
    first = await path.getAttribute('d');
  await expect.poll(() => path.getAttribute('d')).not.toBe(first);
  await page.getByLabel('재생 속도').selectOption('2');
  await page.getByRole('button', { name: '자동 재생', exact: true }).click();
  await expect
    .poll(async () => +(await page.locator('.playback-status').textContent()).match(/^\d+/)[0])
    .toBeGreaterThan(3);
  await page.getByRole('button', { name: '일시정지', exact: true }).click();
  const paused = await page.locator('.playback-status').textContent();
  await page.waitForTimeout(600);
  assert.equal(await page.locator('.playback-status').textContent(), paused);
  await page.getByRole('button', { name: '처음부터', exact: true }).click();
  assert.ok((await page.locator('.playback-status').textContent()).startsWith('0회'));
  console.log('PASS actual gradient learning, interpolated curve, speed, pause and reset');

  await page.goto(base + '#/lesson/kmeans/lab');
  await page.getByLabel('재생 속도').selectOption('2');
  await page.getByRole('button', { name: '자동 재생', exact: true }).click();
  await expect(page.locator('.playback-status')).toContainText('수렴 완료', { timeout: 15000 });
  await expect(page.getByRole('button', { name: '자동 재생', exact: true })).toBeVisible();
  const values = await page.locator('.history-strip circle title').allTextContents();
  const inertia = values.map((v) => +v.split('·')[1]);
  assert.ok(inertia.length > 1);
  for (let i = 1; i < inertia.length; i++) assert.ok(inertia[i] <= inertia[i - 1] + 0.001);
  await page.screenshot({ path: '.qa/motion-kmeans.png', fullPage: true });
  await page.getByRole('button', { name: '처음부터', exact: true }).click();
  assert.ok((await page.locator('.playback-status').textContent()).startsWith('0회'));
  console.log('PASS KMeans auto convergence, monotonic inertia and replay reset');

  for (const id of [
    'polynomial',
    'regularization',
    'tree',
    'knn',
    'logistic',
    'pipeline',
    'kchoice',
    'hierarchy',
    'dbscan',
  ]) {
    await page.goto(base + `#/lesson/${id}/lab`);
    const status = await page.locator('.playback-status').textContent();
    await page.getByLabel('재생 속도').selectOption('2');
    await page.getByRole('button', { name: '자동 재생', exact: true }).click();
    await expect.poll(() => page.locator('.playback-status').textContent()).not.toBe(status);
    const pause = page.getByRole('button', { name: '일시정지', exact: true });
    if (await pause.count()) await pause.click();
    if (id === 'dbscan') {
      assert.ok(await page.locator('.neighborhood ellipse').count());
      const previous = await page.locator('.playback-status').textContent();
      await page.locator('.plot').click({ position: { x: 220, y: 170 } });
      assert.notEqual(await page.locator('.playback-status').textContent(), previous);
      await page.screenshot({ path: '.qa/motion-dbscan.png', fullPage: true });
    }
    assert.equal(
      await page.locator('body').evaluate((el) => el.scrollWidth > innerWidth + 1),
      false,
    );
    console.log('PASS automatic experiment:', id);
  }
  await page.goto(base + '#/lesson/knn/lab');
  const q = page.getByLabel('새 점 x');
  const old = await q.inputValue();
  const box = await page.locator('.plot').boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 6 });
  await page.mouse.up();
  assert.notEqual(await q.inputValue(), old);
  await page.getByRole('button', { name: '자동 재생', exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByRole('button', { name: '자동 재생', exact: true })).toBeVisible();
  await page.evaluate(() => {
    delete document.hidden;
  });
  await page.goto(base + '#/lesson/question/lab');
  await page.goto(base + '#/lesson/knn/lab');
  await expect(page.getByRole('button', { name: '자동 재생', exact: true })).toBeVisible();
  console.log('PASS dragging, background pause and navigation cleanup');

  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ['linear', 'kmeans', 'dbscan', 'hierarchy']) {
    await page.goto(base + `#/lesson/${id}/lab`);
    await page.locator('.playback').waitFor();
    assert.equal(
      await page.locator('body').evaluate((el) => el.scrollWidth > innerWidth + 1),
      false,
    );
  }
  const context = await browser.newContext({ reducedMotion: 'reduce' }),
    reduced = await context.newPage();
  await reduced.goto(base + '#/lesson/linear/lab');
  await reduced.locator('.sample-point').first().waitFor();
  assert.equal(
    await reduced
      .locator('.sample-point')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
    '0s',
  );
  await reduced.getByRole('button', { name: '한 단계 진행', exact: true }).click();
  await reduced.locator('.history-strip').waitFor();
  await context.close();
  console.log('PASS mobile layout and reduced motion preference');
  assert.deepEqual(errors, []);
  console.log('PASS no motion runtime errors');
} finally {
  await browser.close();
}
