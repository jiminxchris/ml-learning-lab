import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as M from '../src/math.js';
import { lessons, tracks, glossary } from '../src/course.js';
const near = (a, b, tol = 1e-7) => assert.ok(Math.abs(a - b) < tol, `${a} differs from ${b}`);
test('OLS recovers a known line and metrics expose poor predictions', () => {
  const fit = M.ols([
    [0, 3],
    [1, 5],
    [2, 7],
  ]);
  near(fit.slope, 2);
  near(fit.intercept, 3);
  near(M.regressionMetrics([1, 2, 3], [1, 2, 3]).r2, 1);
  assert.ok(M.regressionMetrics([1, 2, 3], [10, 10, 10]).r2 < 0);
});
test('standardization ignores a future query and handles constant columns', () => {
  const s = M.standardize([
    [1, 4],
    [2, 4],
    [3, 4],
  ]);
  near(M.mean(s.X.map((p) => p[0])), 0);
  near(M.mean(s.X.map((p) => p[0] ** 2)), 1);
  assert.deepEqual(
    s.X.map((p) => p[1]),
    [0, 0, 0],
  );
  assert.deepEqual(s.transform([2, 4]), [0, 0]);
  const a = M.standardize([
      [1, 4],
      [2, 5],
      [3, 7],
    ]),
    b = M.standardize([
      [1, 400],
      [2, 500],
      [3, 700],
    ]);
  a.X.forEach((r, i) => r.forEach((v, j) => near(v, b.X[i][j])));
});
test('polynomial linear case agrees with OLS; penalties shrink coefficients', () => {
  const points = Array.from({ length: 15 }, (_, i) => [i / 10, (2 * i) / 10 + 3]);
  const fit = M.polynomialFit(points, 1);
  near(fit.predict(0.5), 4);
  const ridge = M.polynomialFit(points, 1, 100),
    lasso = M.polynomialFit(points, 1, 10, 'lasso');
  assert.ok(Math.abs(ridge.weights[0]) < Math.abs(fit.weights[0]));
  near(lasso.weights[0], 0);
});
test('confusion matrix and class averages reveal a majority-only classifier', () => {
  const y = [...Array(95).fill(0), ...Array(5).fill(1)],
    m = M.classificationMetrics(y, Array(100).fill(0));
  near(m.accuracy, 0.95);
  near(m.rows[1].recall, 0);
  near(m.macro, 190 / 195 / 2);
  near(m.weighted, (190 / 195) * 0.95);
  assert.deepEqual(m.matrix, [
    [95, 0],
    [5, 0],
  ]);
});
test('KNN excludes nontraining points, CART and logistic separate two groups', () => {
  const train = [
    [-2, -1, 0],
    [-1, -2, 0],
    [1, 2, 1],
    [2, 1, 1],
  ];
  assert.equal(M.knn(train, [-1.9, -1], 1).label, 0);
  const tree = M.treeFit(train, 2, 'gini', 1);
  near(M.treePredict(tree, [2, 2]), 1);
  near(M.treePredict(tree, [-2, -2]), 0);
  const log = M.logisticFit(train);
  assert.ok(log([2, 2]) > 0.9);
  assert.ok(log([-2, -2]) < 0.1);
});
test('KMeans finds means and inertia in an unambiguous fixture', () => {
  const X = [
      [0, 0],
      [2, 0],
      [10, 0],
      [12, 0],
    ],
    km = M.kmeans(X, 2);
  assert.deepEqual(
    km.centers.map((c) => c[0]).sort((a, b) => a - b),
    [1, 11],
  );
  near(km.inertia, 4);
  assert.equal(km.labels[0], km.labels[1]);
  assert.notEqual(km.labels[0], km.labels[2]);
});
test('Ward linkage heights match the analytic Euclidean fixture', () => {
  const X = [[0], [2], [10], [12]],
    merges = M.ward(X);
  near(merges[0].height, 2);
  near(merges[1].height, 2);
  near(merges[2].height, Math.sqrt(200));
  const l = M.wardLabels(X, merges, 2);
  assert.equal(l[0], l[1]);
  assert.notEqual(l[0], l[2]);
});
test('DBSCAN distinguishes core, border and noise; includes self in min_samples', () => {
  const X = [[0], [0.1], [0.2], [5], [5.1], [5.2], [99]],
    r = M.dbscan(X, 0.15, 3);
  assert.deepEqual(r.labels, [0, 0, 0, 1, 1, 1, -1]);
  assert.deepEqual(r.core, [false, true, false, false, true, false, false]);
  assert.equal(M.dbscan([[0], [1]], 0.01, 1).count, 2);
  assert.ok(M.dbscan(X, 0.15, 4).labels.every((v) => v === -1));
});
test('silhouette agrees with hand distances and handles invalid group counts', () => {
  const r = M.silhouette([[0], [2], [10], [12]], [0, 0, 1, 1]);
  near(r.score, (1 - 2 / 11 + (1 - 2 / 9)) / 2);
  assert.equal(M.silhouette([[0], [1]], [0, 0]).score, null);
  assert.equal(M.silhouette([[0], [1]], [0, 1]).score, null);
});
test('Iris PCA ratios match sklearn reference and preserve centroid projections', () => {
  const iris = JSON.parse(readFileSync(new URL('../src/iris.json', import.meta.url)));
  assert.equal(iris.data.length, 150);
  const X = M.standardize(iris.data).X,
    p = M.pca2(X);
  near(p.ratios[0], 0.7296244541329988, 1e-7);
  near(p.ratios[1], 0.2285076178670178, 1e-7);
  const center = X[0].map((_, j) => M.mean(X.slice(0, 50).map((r) => r[j]))),
    transformed = p.transform(center);
  transformed.forEach((v, j) => near(v, M.mean(p.points.slice(0, 50).map((r) => r[j]))));
});
test('all course units have valid quizzes, tracks and dictionary references', () => {
  assert.equal(lessons.length, 25);
  assert.equal(new Set(lessons.map((l) => l.id)).size, 25);
  for (const l of lessons) {
    assert.ok(tracks.some((t) => t.id === l.track));
    assert.equal(l.steps.length, 4);
    assert.equal(l.quiz.length, 3);
    assert.ok(l.code.length > 100);
    assert.ok(!JSON.stringify(l).includes('\uFFFD'));
    l.quiz.forEach((q) =>
      assert.ok(
        Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length && q.explanation,
      ),
    );
  }
  glossary.forEach((g) => assert.ok(lessons.some((l) => l.id === g[2])));
});
