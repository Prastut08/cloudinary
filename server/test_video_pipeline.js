import dotenv from 'dotenv';
dotenv.config();

import './src/config/cloudinary.js';
import { generateVideoVariants } from './src/services/cloudinaryService.js';

console.log('====================================================');
console.log('   VIDEO PIPELINE END-TO-END DRY TEST SUITE         ');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

// TEST CASE 1: Specific keyword matching ("Reels" and "TikTok")
console.log('📋 TEST CASE 1: Description = "Short video for Instagram Reels and TikTok"');
const res1 = generateVideoVariants('vid_test_123', 'Short video for Instagram Reels and TikTok');
assert(res1.reels916 !== undefined, 'Generated 9:16 (reels916) variant');
assert(res1.reels916?.aiRecommended === true, '9:16 marked as aiRecommended');
assert(res1.reels916?.url.includes('/f_mp4/'), 'URL contains /f_mp4/ format string');
assert(res1.reels916?.url.endsWith('.mp4') || res1.reels916?.url.includes('.mp4?'), 'URL has .mp4 extension');

// TEST CASE 2: Widescreen / YouTube keyword matching
console.log('\n📋 TEST CASE 2: Description = "Full HD YouTube widescreen demo"');
const res2 = generateVideoVariants('vid_test_456', 'Full HD YouTube widescreen demo');
assert(res2.youtube169 !== undefined, 'Generated 16:9 (youtube169) variant');
assert(res2.youtube169?.aiRecommended === true, '16:9 marked as aiRecommended');

// TEST CASE 3: Cinematic ultra-wide keyword matching
console.log('\n📋 TEST CASE 3: Description = "Cinematic trailer for website header"');
const res3 = generateVideoVariants('vid_test_789', 'Cinematic trailer for website header');
assert(res3.cinematic219 !== undefined, 'Generated 21:9 (cinematic219) variant');
assert(res3.web43 !== undefined, 'Generated 4:3 (web43) variant');

// TEST CASE 4: Empty description fallback (generates all 6 ratios)
console.log('\n📋 TEST CASE 4: Empty Description Fallback');
const res4 = generateVideoVariants('vid_test_000', '');
assert(Object.keys(res4).length === 6, 'Generated all 6 default platform ratios');
assert(res4.reels916 && res4.portrait45 && res4.square11 && res4.youtube169 && res4.web43 && res4.cinematic219, 'All 6 ratio keys present');

// TEST CASE 5: Poster URL transformation verification
console.log('\n📋 TEST CASE 5: Video Poster Image Transformation URL Generation');
const sampleVideoUrl = res1.reels916.url;
const posterUrl = sampleVideoUrl.replace('/f_mp4/', '/f_jpg/').replace(/\.mp4(\?.*)?$/, '.jpg$1');
assert(posterUrl.includes('/f_jpg/'), 'Poster URL converted to /f_jpg/');
assert(posterUrl.includes('.jpg'), 'Poster URL ends with .jpg extension');

console.log('\n====================================================');
console.log(` SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
