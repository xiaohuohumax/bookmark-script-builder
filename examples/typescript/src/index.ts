/**
 * #name 显示时间
 * #icon ../static/clock.png
 * #isBuild true
 */

import { getNowTimestamp } from './util';

import meta from 'bookmark:meta';

console.log(meta, import.meta.env.APP_NAME);

alert(getNowTimestamp());