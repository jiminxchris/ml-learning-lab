import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { lessons } from '../src/course.js';
const base = process.env.QA_URL || 'http://127.0.0.1:5173/';
mkdirSync('.qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({
  viewport: { width: 1512, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.goto(base);
await page.getByRole('heading', { name: '어떤 원리가 궁금한가요?' }).waitFor();
await page.screenshot({ path: '.qa/home-desktop.png', fullPage: true });
for (const lesson of lessons) {
  for (const tab of ['concept', 'lab', 'code', 'quiz']) {
    await page.goto(`${base}#/lesson/${lesson.id}/${tab}`);
    await page.getByRole('heading', { name: lesson.title, exact: true }).waitFor();
    await page
      .getByRole('tab', {
        name: new RegExp(
          { concept: '개념 이해', lab: '시뮬레이션', code: 'Python 실습', quiz: '확인 퀴즈' }[tab],
        ),
      })
      .waitFor();
    if (await page.locator('body').evaluate((el) => el.scrollWidth > window.innerWidth + 1))
      throw Error(`Overflow ${lesson.id}/${tab}`);
    if (tab === 'lab') {
      for (const input of await page.locator('input[type="range"]').all()) {
        await input.fill(await input.getAttribute('max'));
        await input.dispatchEvent('input');
      }
      if (['linear', 'dbscan', 'pca', 'selectors', 'dynamic'].includes(lesson.id))
        await page.screenshot({ path: `.qa/lab-${lesson.id}.png`, fullPage: true });
    }
  }
  console.log(`PASS ${lesson.id}: concept / lab / code / quiz`);
}
// Actually grade wrong answers, retry and persist full completion and a note.
const lesson = lessons[0];
await page.goto(`${base}#/lesson/question/quiz`);
let cards = page.locator('.quiz-card');
await cards
  .nth(0)
  .getByRole('radio')
  .nth((lesson.quiz[0].answer + 1) % 3)
  .check();
await cards.nth(0).getByRole('button', { name: '답 확인하기' }).click();
await page.goto(`${base}#/review`);
await page.getByRole('heading', { name: lesson.quiz[0].prompt, exact: true }).waitFor();
await page.goto(`${base}#/lesson/question/quiz`);
cards = page.locator('.quiz-card');
for (let i = 0; i < lesson.quiz.length; i++) {
  await cards.nth(i).getByRole('radio').nth(lesson.quiz[i].answer).check();
  const button = cards.nth(i).getByRole('button', { name: '답 확인하기' });
  if (await button.isEnabled()) await button.click();
}
await page.locator('.completed-banner').waitFor();
await page.goto(`${base}#/lesson/question/lab`);
await page.locator('#observation').fill('QA: 직접 바꾼 설정과 결과를 관찰했습니다.');
await page.reload();
await page.locator('#observation').waitFor();
if (
  (await page.locator('#observation').inputValue()) !== 'QA: 직접 바꾼 설정과 결과를 관찰했습니다.'
)
  throw Error('Note persistence failed');
await page.goto(`${base}#/progress`);
await page.getByText('QA: 직접 바꾼 설정과 결과를 관찰했습니다.', { exact: true }).waitFor();
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: '학습 기록 내보내기' }).click();
await downloadPromise;
console.log('PASS quiz wrong-answer review, retry, completion, persisted note, report download');
await page.goto(`${base}#/lesson/selectors/lab`);
await page.locator('#css-selector').fill('.quote > .author');
if ((await page.locator('.result-heading b').textContent()) !== '0개')
  throw Error('Child selector wrong');
await page.locator('#css-selector').fill('.quote .author');
if ((await page.locator('.result-heading b').textContent()) !== '2개')
  throw Error('Descendant selector wrong');
await page.locator('#css-selector').fill('[');
await page.locator('.error-message').waitFor();
await page.goto(`${base}#/lesson/dynamic/lab`);
await page.getByRole('button', { name: '브라우저처럼 JS 실행' }).click();
await page.locator('.mock-browser article').first().waitFor();
console.log('PASS CSS selection, invalid selector handling, JS DOM demonstration');
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + '#/');
await page.screenshot({ path: '.qa/home-mobile.png', fullPage: true });
await page.getByRole('button', { name: '메뉴 열기' }).click();
await page.locator('.sidebar.open').waitFor();
await page.getByRole('button', { name: '메뉴 닫기' }).last().click();
for (const lesson of lessons) {
  await page.goto(`${base}#/lesson/${lesson.id}/lab`);
  await page.getByRole('heading', { name: lesson.title, exact: true }).waitFor();
  if (await page.locator('body').evaluate((el) => el.scrollWidth > window.innerWidth + 1))
    throw Error(`Mobile overflow: ${lesson.id}`);
}
await page.goto(`${base}#/lesson/pca/lab`);
await page.screenshot({ path: '.qa/pca-mobile.png', fullPage: true });
console.log('PASS 25 mobile lab pages and menu');
await browser.close();
if (errors.length) throw Error(errors.join('\n'));
console.log('PASS no browser runtime errors');
