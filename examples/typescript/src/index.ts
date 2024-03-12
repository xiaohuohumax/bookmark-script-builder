/**
 * #name 显示时间
 * #icon ../static/clock.png
 * #version 1.0.0
 * #description 显示当前时间
 * #isBuild true
 */

import { getNowTimestamp } from './util';

import meta from 'bookmark:meta';

console.log(meta, import.meta.env.APP_NAME);

alert(getNowTimestamp());