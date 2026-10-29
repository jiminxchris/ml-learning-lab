// Small, deterministic educational implementations. All chart values are calculated.
export const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
export const sum = (a) => a.reduce((s, v) => s + v, 0);
export function rng(seed = 42) {
  let n = seed >>> 0;
  return () => {
    n = (1664525 * n + 1013904223) >>> 0;
    return n / 4294967296;
  };
}
export function normal(r) {
  return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
}
export const distance2 = (a, b) => sum(a.map((v, i) => (v - b[i]) ** 2));
export function standardize(X) {
  const mu = X[0].map((_, j) => mean(X.map((r) => r[j])));
  const sd = mu.map((v, j) => Math.sqrt(mean(X.map((r) => (r[j] - v) ** 2))) || 1);
  return {
    X: X.map((r) => r.map((v, j) => (v - mu[j]) / sd[j])),
    mu,
    sd,
    transform: (r) => r.map((v, j) => (v - mu[j]) / sd[j]),
  };
}
export function regressionMetrics(y, p) {
  const mse = mean(y.map((v, i) => (v - p[i]) ** 2));
  const tss = sum(y.map((v) => (v - mean(y)) ** 2));
  return {
    mse,
    rmse: Math.sqrt(mse),
    mae: mean(y.map((v, i) => Math.abs(v - p[i]))),
    r2: tss ? 1 - (y.length * mse) / tss : NaN,
  };
}
export function ols(points) {
  const mx = mean(points.map((p) => p[0])),
    my = mean(points.map((p) => p[1]));
  const den = sum(points.map((p) => (p[0] - mx) ** 2));
  const slope = den ? sum(points.map((p) => (p[0] - mx) * (p[1] - my))) / den : 0;
  return { slope, intercept: my - slope * mx };
}
export function syntheticRegression(seed = 42, n = 80) {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const x = r() * 2 - 1;
    return [x, 2 * x + 1.2 * Math.sin(4 * x) + normal(r) * 0.38, i % 4 === 0 ? 'test' : 'train'];
  });
}
// Coordinate descent on standardized polynomial columns. Objective:
// mean squared error + alpha * sum(coef^2) (Ridge), or alpha * sum(abs(coef)) (Lasso).
// Alpha convention is explicitly educational, not sklearn Ridge's summed-error alpha.
export function polynomialFit(points, degree = 3, alpha = 0, kind = 'ridge') {
  const raw = points.map((p) => Array.from({ length: degree }, (_, j) => p[0] ** (j + 1))),
    s = standardize(raw),
    ym = mean(points.map((p) => p[1]));
  const y = points.map((p) => p[1] - ym),
    w = Array(degree).fill(0),
    pred = Array(y.length).fill(0);
  for (let it = 0; it < 1200; it++) {
    let delta = 0;
    for (let j = 0; j < degree; j++) {
      const old = w[j],
        rho = mean(y.map((v, i) => s.X[i][j] * (v - pred[i] + old * s.X[i][j])));
      const z = mean(s.X.map((r) => r[j] ** 2));
      w[j] =
        kind === 'lasso'
          ? (Math.sign(rho) * Math.max(0, Math.abs(rho) - alpha / 2)) / (z || 1)
          : rho / (z + alpha || 1);
      for (let i = 0; i < y.length; i++) pred[i] += (w[j] - old) * s.X[i][j];
      delta = Math.max(delta, Math.abs(w[j] - old));
    }
    if (delta < 1e-7) break;
  }
  return {
    weights: w,
    predict: (x) => ym + sum(w.map((v, j) => (v * (x ** (j + 1) - s.mu[j])) / s.sd[j])),
  };
}
export function classificationMetrics(y, p, classes = [0, 1]) {
  const matrix = classes.map((a) =>
    classes.map((b) => y.reduce((n, v, i) => n + (v === a && p[i] === b ? 1 : 0), 0)),
  );
  const rows = classes.map((c, i) => {
    const tp = matrix[i][i],
      support = sum(matrix[i]),
      predicted = sum(matrix.map((r) => r[i]));
    const precision = predicted ? tp / predicted : 0,
      recall = support ? tp / support : 0;
    return {
      c,
      support,
      precision,
      recall,
      f1: precision + recall ? (2 * precision * recall) / (precision + recall) : 0,
    };
  });
  return {
    matrix,
    rows,
    accuracy: mean(y.map((v, i) => +(v === p[i]))),
    macro: mean(rows.map((r) => r.f1)),
    weighted: sum(rows.map((r) => r.f1 * r.support)) / y.length,
  };
}
export function classificationData(seed = 17, n = 100) {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const c = i % 2;
    return [
      normal(r) * 0.85 + (c ? 1 : -1),
      normal(r) * 0.9 + (c ? 0.7 : -0.6),
      c,
      i % 5 === 0 ? 'test' : 'train',
    ];
  });
}
export function knn(train, q, k = 5) {
  const neighbors = train
    .map((p) => ({ p, d: distance2(p.slice(0, 2), q) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
  const score = mean(neighbors.map((v) => v.p[2]));
  return { label: score >= 0.5 ? 1 : 0, score, neighbors };
}
export const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, z))));
export function logisticFit(train) {
  let w = [0, 0, 0];
  for (let it = 0; it < 350; it++) {
    const g = [0, 0, 0];
    for (const p of train) {
      const e = sigmoid(w[0] + w[1] * p[0] + w[2] * p[1]) - p[2];
      g[0] += e;
      g[1] += e * p[0];
      g[2] += e * p[1];
    }
    w = w.map((v, j) => v - (0.15 * g[j]) / train.length);
  }
  return (q) => sigmoid(w[0] + w[1] * q[0] + w[2] * q[1]);
}
function impurity(rows, kind) {
  if (!rows.length) return 0;
  const p = mean(rows.map((r) => r[2]));
  return kind === 'entropy'
    ? p === 0 || p === 1
      ? 0
      : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p)
    : 2 * p * (1 - p);
}
export function treeFit(rows, depth = 3, kind = 'gini', minLeaf = 2) {
  const score = mean(rows.map((r) => r[2])),
    node = { score, n: rows.length };
  if (depth === 0 || score === 0 || score === 1 || rows.length < 2 * minLeaf) return node;
  let best = Infinity,
    bestSplit;
  for (let j = 0; j < 2; j++) {
    const vals = [...new Set(rows.map((p) => p[j]))].sort((a, b) => a - b);
    for (let i = 1; i < vals.length; i++) {
      const t = (vals[i - 1] + vals[i]) / 2,
        l = rows.filter((p) => p[j] <= t),
        r = rows.filter((p) => p[j] > t);
      if (l.length < minLeaf || r.length < minLeaf) continue;
      const loss = (l.length * impurity(l, kind) + r.length * impurity(r, kind)) / rows.length;
      if (loss < best) {
        best = loss;
        bestSplit = { j, t, l, r };
      }
    }
  }
  if (!bestSplit || best >= impurity(rows, kind) - 1e-12) return node;
  const { j, t, l, r } = bestSplit;
  return {
    ...node,
    j,
    t,
    left: treeFit(l, depth - 1, kind, minLeaf),
    right: treeFit(r, depth - 1, kind, minLeaf),
  };
}
export function treePredict(node, p) {
  return node.left ? treePredict(p[node.j] <= node.t ? node.left : node.right, p) : node.score;
}
export function forestFit(train, depth = 3, n = 9) {
  const r = rng(29),
    trees = Array.from({ length: n }, () =>
      treeFit(
        Array.from({ length: train.length }, () => train[Math.floor(r() * train.length)]),
        depth,
        'gini',
        3,
      ),
    );
  return (p) => mean(trees.map((t) => treePredict(t, p)));
}
export function clusterData(type = 'blobs', seed = 42) {
  const r = rng(seed);
  if (type === 'moons')
    return Array.from({ length: 90 }, (_, i) => {
      const t = r() * Math.PI,
        c = i % 2;
      return [c ? 1 - Math.cos(t) : Math.cos(t), c ? 0.5 - Math.sin(t) : Math.sin(t)].map(
        (v) => v + normal(r) * 0.055,
      );
    });
  if (type === 'rings')
    return Array.from({ length: 100 }, (_, i) => {
      const t = r() * Math.PI * 2,
        rad = (i % 2 ? 1.8 : 0.65) + normal(r) * 0.07;
      return [Math.cos(t) * rad, Math.sin(t) * rad];
    });
  return Array.from({ length: 75 }, (_, i) => {
    const c = [
      [-1.6, -0.7],
      [0.5, 1.4],
      [1.5, -1],
    ][i % 3];
    return c.map((v) => v + normal(r) * 0.45);
  });
}
export function initialCenters(X, k, seed = 42) {
  const r = rng(seed),
    centers = [X[Math.floor(r() * X.length)].slice()];
  while (centers.length < k) {
    const d = X.map((x) => Math.min(...centers.map((c) => distance2(x, c))));
    let pick = r() * sum(d),
      idx = d.findIndex((v) => (pick -= v) <= 0);
    if (idx < 0) idx = X.length - 1;
    centers.push(X[idx].slice());
  }
  return centers;
}
export function kmeansStep(X, centers) {
  const labels = X.map((p) =>
    centers.map((c) => distance2(p, c)).reduce((b, d, i, a) => (d < a[b] ? i : b), 0),
  );
  const next = centers.map((c, j) => {
    const rows = X.filter((_, i) => labels[i] === j);
    return rows.length ? c.map((_, d) => mean(rows.map((r) => r[d]))) : c;
  });
  return { labels, centers: next, inertia: sum(X.map((p, i) => distance2(p, next[labels[i]]))) };
}
export function kmeans(X, k = 3, seed = 42, iterations = 30) {
  let centers = initialCenters(X, k, seed),
    res;
  for (let i = 0; i < iterations; i++) {
    res = kmeansStep(X, centers);
    const diff = sum(centers.map((c, j) => distance2(c, res.centers[j])));
    centers = res.centers;
    if (diff < 1e-12) break;
  }
  return res;
}
export function dbscan(X, eps = 0.4, minSamples = 5) {
  const labels = Array(X.length).fill(-2);
  let c = 0;
  const neighbors = (i) => X.map((_, j) => j).filter((j) => distance2(X[i], X[j]) <= eps ** 2);
  const core = X.map((_, i) => neighbors(i).length >= minSamples);
  for (let i = 0; i < X.length; i++) {
    if (labels[i] !== -2) continue;
    if (!core[i]) {
      labels[i] = -1;
      continue;
    }
    labels[i] = c;
    const queue = neighbors(i),
      seen = new Set(queue);
    for (let j = 0; j < queue.length; j++) {
      const q = queue[j];
      if (labels[q] === -1) labels[q] = c;
      if (labels[q] !== -2) continue;
      labels[q] = c;
      if (core[q])
        for (const t of neighbors(q))
          if (!seen.has(t)) {
            seen.add(t);
            queue.push(t);
          }
    }
    c++;
  }
  return { labels, core, count: c };
}
export function silhouette(X, labels) {
  const groups = [...new Set(labels)];
  if (groups.length < 2 || groups.length >= X.length) return { score: null, values: [] };
  const values = X.map((x, i) => {
    const own = X.map((_, j) => j).filter((j) => labels[j] === labels[i] && j !== i);
    if (!own.length) return 0;
    const a = mean(own.map((j) => Math.sqrt(distance2(x, X[j]))));
    const b = Math.min(
      ...groups
        .filter((g) => g !== labels[i])
        .map((g) =>
          mean(
            X.map((_, j) => j)
              .filter((j) => labels[j] === g)
              .map((j) => Math.sqrt(distance2(x, X[j]))),
          ),
        ),
    );
    return Math.max(a, b) ? (b - a) / Math.max(a, b) : 0;
  });
  return { values, score: mean(values) };
}
export function ward(X) {
  let groups = X.map((p, i) => ({ id: i, ids: [i], center: p })),
    merges = [];
  while (groups.length > 1) {
    let best = Infinity,
      pair;
    for (let a = 0; a < groups.length; a++)
      for (let b = a + 1; b < groups.length; b++) {
        const g = groups[a],
          h = groups[b],
          cost =
            ((g.ids.length * h.ids.length) / (g.ids.length + h.ids.length)) *
            distance2(g.center, h.center);
        if (cost < best) {
          best = cost;
          pair = [a, b];
        }
      }
    const [a, b] = pair,
      g = groups[a],
      h = groups[b],
      ids = [...g.ids, ...h.ids],
      node = {
        id: X.length + merges.length,
        ids,
        center: g.center.map(
          (v, j) => (v * g.ids.length + h.center[j] * h.ids.length) / ids.length,
        ),
      };
    merges.push({ ...node, left: g.id, right: h.id, height: Math.sqrt(2 * best) });
    groups = groups.filter((_, i) => i !== a && i !== b);
    groups.push(node);
  }
  return merges;
}
export function wardLabels(X, merges, k) {
  let groups = new Map(X.map((_, i) => [i, [i]]));
  for (const m of merges.slice(0, X.length - k)) {
    groups.delete(m.left);
    groups.delete(m.right);
    groups.set(m.id, m.ids);
  }
  const labels = Array(X.length);
  [...groups.values()].forEach((ids, g) => ids.forEach((i) => (labels[i] = g)));
  return labels;
}
export function pca2(X) {
  const mu = X[0].map((_, j) => mean(X.map((r) => r[j]))),
    centered = X.map((r) => r.map((v, j) => v - mu[j])),
    d = mu.length;
  let C = Array.from({ length: d }, (_, a) =>
    Array.from({ length: d }, (_, b) => sum(centered.map((r) => r[a] * r[b])) / (X.length - 1)),
  );
  const total = sum(C.map((r, i) => r[i])),
    vecs = [],
    eigen = [];
  for (let q = 0; q < 2; q++) {
    let v = Array.from({ length: d }, (_, i) => 1 / (i + 1 + q));
    for (let it = 0; it < 150; it++) {
      let next = C.map((r) => sum(r.map((x, j) => x * v[j])));
      const norm = Math.sqrt(sum(next.map((x) => x * x))) || 1;
      v = next.map((x) => x / norm);
    }
    const ev = sum(v.map((x, i) => x * sum(C[i].map((c, j) => c * v[j]))));
    vecs.push(v);
    eigen.push(ev);
    C = C.map((r, i) => r.map((x, j) => x - ev * v[i] * v[j]));
  }
  const transform = (r) => vecs.map((v) => sum(v.map((a, j) => a * (r[j] - mu[j]))));
  return {
    points: X.map(transform),
    transform,
    ratios: eigen.map((v) => v / total),
    components: vecs,
  };
}
