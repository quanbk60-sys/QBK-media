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
