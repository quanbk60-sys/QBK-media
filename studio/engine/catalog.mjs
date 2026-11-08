#!/usr/bin/env node
// Prints the live catalog of poses, expressions, cycles, props, sfx and costume fields (JSON).
import {POSES, EXPR, CYCLES} from './lib/character.mjs';
import {PROP_NAMES} from './lib/props.mjs';
import {SFX_KINDS} from './lib/audio.mjs';
import {STYLES} from './lib/styles.mjs';
console.log(JSON.stringify({
  poses: Object.keys(POSES), expressions: Object.keys(EXPR), cycles: CYCLES,
  styles: Object.entries(STYLES).map(([k, v]) => `${k} (${v.label}: ${v.genres})`),
  props: PROP_NAMES, sfx: SFX_KINDS,
  costume: ['headband', 'hat (official|crown|helmet|cone|cap)', 'hatColor', 'beard', 'sash', 'sashX', 'belt', 'cape', 'robe', 'robeTrim', 'body', 'shoes', 'prop (spear|sword|dagger|hammer|oar|flag|scroll|seal)', 'propColor', 'ears (bunny|rabbit)', 'earsDown (0..1)', 'earColor', 'tail (bunny)', 'tailColor', 'shell (turtle|colour)', 'shellColor'],
  colors: ['ink', 'paper', 'red', 'navy', 'gold', 'green', 'wood', 'steel', 'water', 'waterDeep', 'white', 'skin', 'sky', '#hex'],
}, null, 1));
