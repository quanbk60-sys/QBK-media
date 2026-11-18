import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Recorder, play, strokeLength} from '../lib/recorder.mjs';
import {drawCharacter, POSES, EXPR, blendPose} from '../lib/character.mjs';
import {PROPS} from '../lib/props.mjs';
import {validate} from '../lib/scene.mjs';
import {synth, SFX_KINDS} from '../lib/audio.mjs';

test('every pose x expression draws into the recorder', () => {
  for (const p of Object.keys(POSES)) for (const e of Object.keys(EXPR)) {
    const R = new Recorder(); drawCharacter(R, {pose: blendPose(p, p, 0), expr: e, costume: {headband: 'red', hat: 'crown', cape: 'navy', prop: 'spear', sash: 'red', belt: 'red', beard: true}});
    assert.ok(R.ops.length > 10 && strokeLength(R.ops) > 100, `${p}/${e}`);
  }
});
test('every prop draws with strokes', () => { for (const [n, f] of Object.entries(PROPS)) { const R = new Recorder(); f(R, {}, 1); assert.ok(R.ops.length > 0, n); } });
test('every sfx synthesises finite audio', () => { for (const k of SFX_KINDS) { const a = synth(k, 0.3); assert.ok(a.length > 0 && a.every(Number.isFinite), k); } });
test('scene validation rejects gaps and unknown names', () => {
  const base = {cast: {a: {}}, shots: [{start: 0, end: 1, elements: [{type: 'actor', cast: 'a', acting: [{t: 0, pose: 'stand'}]}]}]};
  validate(structuredClone(base));
  assert.throws(() => validate({...base, shots: [{start: 0.5, end: 1}]}), /expected 0/);
  assert.throws(() => validate({cast: {}, shots: [{start: 0, end: 1, elements: [{type: 'prop', name: 'nope'}]}]}), /unknown prop/);
  assert.throws(() => validate({cast: {a: {}}, shots: [{start: 0, end: 1, elements: [{type: 'actor', cast: 'a', acting: [{t: 0, pose: 'moonwalk'}]}]}]}), /unknown pose/);
});
test('v2 costume parts (ears, tail, shell) draw for every pose x expression and new cycles', async () => {
  const {applyCycle, CYCLES} = await import('../lib/character.mjs');
  for (const p of Object.keys(POSES)) for (const e of Object.keys(EXPR)) for (const c of [{ears: 'bunny', tail: 'bunny', earsDown: e === 'happy' ? 1 : undefined}, {shell: 'turtle', shellColor: e === 'sad' ? '#8A6A3A' : undefined}]) {
    const R = new Recorder(); drawCharacter(R, {pose: blendPose(p, p, 0), expr: e, costume: c, t: 0.7});
    assert.ok(R.ops.length > 10 && R.ops.every(o => o.k !== 's' || o.paths.every(q => q.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)))), `${p}/${e}`);
  }
  for (const cy of CYCLES) for (const t of [0, 0.3, 1.1]) { const q = applyCycle(blendPose('stand', 'stand', 0), cy, t, 1); for (const v of Object.values(q)) if (typeof v === 'number') assert.ok(Number.isFinite(v), `${cy}@${t}`); }
});
test('v2 props accept their parameters', () => {
  for (const [n, p] of [['finishLine', {broken: 0.5, label: 'ĐÍCH'}], ['finishLine', {tape: false}], ['startLine', {label: 'XUẤT PHÁT'}], ['checkerFlag', {wind: 2}], ['zzz', {size: 1.5}], ['dust', {dir: -1, progress: 0.5}], ['dust', {progress: 0}], ['thought', {text: 'Hi', icon: 'pillow', progress: 0.3}]]) {
    const R = new Recorder(); PROPS[n](R, p, 1.3); if (p.progress !== 0) assert.ok(R.ops.length > 0, n);
  }
});
test('cat-dan collage elements render every type without errors', async () => {
  const {loadScene, makeRenderer, fitCaptions, preloadImages} = await import('../lib/scene.mjs');
  const {COLLAGE_TYPES} = await import('../lib/collage.mjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'catdan-')), f = path.join(dir, 'scene.json');
  const els = [{type: 'plate', kind: 'map'}, {type: 'cutout', silhouette: 'person', w: 200, h: 260, censor: [0.5, 0.2, 0.6]}, {type: 'scrap', text: 'Ngày 1', color: 'news'}, {type: 'tape'}, {type: 'stampbox', text: 'Mật'},
    {type: 'strip', text: 'HỒ SƠ'}, {type: 'tack'}, {type: 'yarn', points: [[100, 100], [500, 400]]}, {type: 'scribble', kind: 'arrow', note: 'đây'}, {type: 'bigstat', value: '1.288', label: 'NĂM'},
    {type: 'timeline', items: [{year: '938'}, {year: '1288', text: 'Trận 3'}]}, {type: 'icons', n: 12, highlight: [2]}, {type: 'shape', kind: 'burst'}, {type: 'headline', text: 'Kế cũ', highlight: true}, {type: 'doc', title: 'Biên bản'}, {type: 'chart', kind: 'bar', values: [1, 3, 2]}];
  assert.deepStrictEqual([...new Set(els.map(e => e.type))].sort(), [...COLLAGE_TYPES].sort());
  fs.writeFileSync(f, JSON.stringify({style: 'cat-dan', captions: {items: [{start: 0, end: 2, text: 'Thử phụ đề'}]}, shots: [{start: 0, end: 1, elements: els}, {start: 1, end: 2, transition: 'tear', elements: [{type: 'headline', text: 'Hai'}]}]}));
  const s = loadScene(f); fitCaptions(s); await preloadImages(s); const R = makeRenderer(s);
  for (const T of [0.1, 0.5, 0.95, 1.1, 1.9]) R.frame(T);
  assert.ok(s.shots[0].sfx.some(x => x.kind === 'paper') && s.shots[0].sfx.some(x => x.kind === 'thud'));
});
