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

test('bds elements draw with a tilted view and keep labels inside the frame', async () => {
  const {createCanvas} = await import('@napi-rs/canvas');
  const {BDS_PAINT, LAYOUT} = await import('../lib/bds.mjs');
  const {sampleView, project} = await import('../lib/geo.mjs');
  const s = {width: 1080, height: 1920, base: '.', captionStyle: {y: 250, size: 54}, _rects: []};
  const v = sampleView([{t: 0, lat: 10.87, lon: 106.738, zoom: 14, tilt: 40}], 0), c = createCanvas(1080, 1920).getContext('2d');
  const [x, y] = project(v, s, 10.87, 106.738); assert.ok(Math.abs(x - 540) < 1 && Math.abs(y - 960) < 1, 'view centre stays at frame centre');
  const near = project(v, s, 10.86, 106.738), far = project(v, s, 10.88, 106.738); assert.ok(near[2] > 1 && far[2] < 1, 'perspective: near bigger, far smaller');
  const els = [['bdsShade', {}], ['bdsRoute', {path: [[10.87, 106.738], [10.875, 106.75], [10.88, 106.76]], sty: 'ruby'}],
    ['bdsPin', {geo: [10.87, 106.738], label: 'DỰ ÁN', project: true, pop: false, id: 'project'}], ['bdsPin', {geo: [10.8705, 106.7385], label: 'Một địa điểm rất dài tên', sty: 'blue', id: 'poi', from: -2}],
    ['bdsCard', {cat: 'Y TẾ', name: 'Bệnh viện', km: 5.7, min: 6, index: 0, total: 4, from: -2}], ['bdsBar', {name: 'DỰ ÁN', area: 'KHU VỰC', colors: ['ruby', 'gold'], active: 1}],
    ['bdsHeadline', {lines: ['A', 'B'], sub: 'c'}], ['bdsOutro', {name: 'N', cta: 'LIÊN HỆ', from: -2}], ['bdsFooter', {text: 'x', credit: 'y'}], ['bdsSpecs', {items: [{icon: 'area', label: 'Diện tích', value: '55 m²'}], from: -2}], ['bdsChips', {items: ['Hồ bơi', 'Gym'], from: -2}], ['bdsCaption', {kicker: 'k', title: 't', sub: 's', from: -2}]];
  for (const [type, e] of els) BDS_PAINT[type](c, {type, ...e, _shotDur: 5}, 1, s, v);
  const L = LAYOUT(s), labels = s._rects.filter(r => r.kind === 'label');
  assert.equal(labels.length, 2);
  for (const r of labels) assert.ok(r.x0 >= L.M - 1 && r.x1 <= 1080 - L.M + 1, `label ${r.id} inside margins`);
  assert.ok(!(labels[0].x0 < labels[1].x1 && labels[0].x1 > labels[1].x0 && labels[0].y0 < labels[1].y1 && labels[0].y1 > labels[1].y0) || labels[1].mode === 'center*', 'labels avoid each other');
});
