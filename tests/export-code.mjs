import { writeFileSync, mkdirSync } from 'node:fs';
import { lessons } from '../src/course.js';
mkdirSync('.qa/python', { recursive: true });
for (const lesson of lessons) writeFileSync(`.qa/python/${lesson.id}.py`, lesson.code);
console.log(`Exported ${lessons.length} independent Python examples.`);
