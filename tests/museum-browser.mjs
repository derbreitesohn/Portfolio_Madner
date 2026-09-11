import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.MUSEUM_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const out = 'test-results';
await mkdir(out, { recursive: true });
const report = { desktop: {}, mobile: {}, failureRecovery: {}, pageErrors: [], graphicsErrors: [] };
const observe = (page) => {
  page.on('pageerror', (error) => report.pageErrors.push(String(error)));
  page.on('console', (message) => {
    if (/GL_INVALID|WebGL.*ERROR|shader error/i.test(message.text())) report.graphicsErrors.push(message.text());
  });
};
const position = async (page) => (await page.locator('.museum').getAttribute('data-position')).split(',').map(Number);
const waitReady = (page) => page.waitForFunction(() => document.querySelector('.museum')?.dataset.ready === 'true', null, { timeout: 90000 });
const waitActive = (page) => page.waitForFunction(() => document.querySelector('.museum')?.dataset.active === 'true');
const expected = [
  ['Pat Pat', 'https://patpat-three.vercel.app'],
  ['Meniscus', 'https://meniscus.vercel.app'],
  ['Liji: Virtual Closet Tracker', 'https://github.com/derbreitesohn/Liji'],
  ['CCL1-PawsUp', 'https://derbreitesohn.github.io/CCL1-PawsUp/'],
  ['Portfolio_Madner', 'https://github.com/derbreitesohn/Portfolio_Madner'],
  ['SteelFang', 'https://github.com/derbreitesohn/SteelFang'],
];
try {
  const desktop = await browser.newPage({ viewport: {width:1440,height:960} });
  observe(desktop);
  let museumRequests = 0;
  desktop.on('request', (r) => { if (r.url().includes('museum.glb')) museumRequests++; });
  await desktop.goto(base);
  await desktop.getByRole('button', {name:'Enter 3D Museum',exact:true}).waitFor({timeout:20000});
  assert.equal(museumRequests, 0, '2D home page eagerly downloaded the museum');
  await desktop.getByRole('button', {name:'Enter 3D Museum',exact:true}).click();
  await waitReady(desktop);
  await desktop.screenshot({path:`${out}/museum-welcome.png`});
  await desktop.getByRole('button', {name:'Enter the museum',exact:true}).click();
  await waitActive(desktop);
  await desktop.waitForTimeout(400);
  const before = await position(desktop);
  await desktop.keyboard.down('KeyA');
  await desktop.waitForTimeout(1100);
  await desktop.keyboard.up('KeyA');
  await desktop.waitForTimeout(300);
  const after = await position(desktop);
  assert.ok(after[0] < before[0] - 2, 'WASD did not move the player');
  await desktop.keyboard.press('Escape');
  await desktop.getByRole('button',{name:'Continue walking',exact:true}).waitFor();
  // The visible position/map snapshot is sampled every 250 ms.
  await desktop.waitForTimeout(350);
  const paused = await position(desktop);
  await desktop.keyboard.down('KeyW');
  await desktop.waitForTimeout(350);
  await desktop.keyboard.up('KeyW');
  assert.deepEqual(await position(desktop), paused, 'Player moved while paused');
  const frames = [];
  for (let i = 0; i < 6; i++) {
    await desktop.getByRole('button',{name:/^Gallery/}).click();
    assert.equal(await desktop.locator('.museum-project-grid article').count(), 6);
    await desktop.getByRole('button',{name:'Visit this frame',exact:true}).nth(i).click();
    await desktop.getByRole('button',{name:'Continue walking',exact:true}).click();
    await waitActive(desktop);
    await desktop.locator('.museum-interact').waitFor({timeout:10000});
    assert.ok((await desktop.locator('.museum-interact').innerText()).includes(expected[i][0]));
    if (i === 0 || i === 5) await desktop.screenshot({path:`${out}/museum-frame-${i + 1}.png`});
    if (i % 2 === 0) await desktop.keyboard.press('KeyE');
    else await desktop.mouse.click(720, 480);
    await desktop.getByRole('dialog', {name:expected[i][0], exact:true}).waitFor();
    assert.equal(await desktop.getByRole('link',{name:'Explore project',exact:true}).getAttribute('href'), expected[i][1]);
    const focusTrapped = await desktop.evaluate(() => document.querySelector('dialog')?.contains(document.activeElement));
    assert.ok(focusTrapped, 'Project dialog did not receive focus');
    if (i === 0) await desktop.screenshot({path:`${out}/museum-project.png`});
    frames.push(expected[i][0]);
    await desktop.keyboard.press('Escape');
  }
  await desktop.getByText('Return to entrance', {exact:false}).click();
  const reset = await position(desktop);
  assert.ok(Math.abs(reset[0]) < 0.1 && Math.abs(reset[2] - 24) < .1);
  await desktop.getByLabel('Lighter graphics').check();
  await desktop.getByRole('button', {name:'Continue walking',exact:true}).click();
  await desktop.waitForTimeout(500);
  await desktop.screenshot({path:`${out}/museum-walk.png`});
  await desktop.keyboard.press('Escape');
  await desktop.getByRole('button', {name:'Portfolio',exact:true}).click();
  await desktop.waitForURL(base + '/');
  await desktop.locator('.museum').waitFor({state:'hidden'});
  assert.equal(await desktop.locator('.museum').count(), 0);
  report.desktop = { movementBefore:before, movementAfter:after, pauseStopsMovement:true, frames, keyboardAndMouseInteraction:true, returnedToPortfolio:true };
  console.log('Desktop walkthrough: passed');
  await desktop.close();

  const mobile = await browser.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:1, isMobile:true, hasTouch:true });
  observe(mobile);
  await mobile.goto(base + '/museum');
  await waitReady(mobile);
  await mobile.screenshot({path:`${out}/museum-mobile-welcome.png`});
  await mobile.getByRole('button',{name:'Enter the museum',exact:true}).tap();
  await waitActive(mobile);
  const stick = mobile.getByRole('group',{name:'Touch movement control'});
  await stick.waitFor();
  const box = await stick.boundingBox();
  const mobileBefore = await position(mobile);
  // Browser touch events exercise pointer capture and the real joystick handlers.
  const session = await mobile.context().newCDPSession(mobile);
  await session.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:box.x+58,y:box.y+58}]});
  await session.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:box.x+20,y:box.y+58}]});
  await mobile.waitForTimeout(900);
  await session.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
  await mobile.waitForTimeout(300);
  const mobileAfter = await position(mobile);
  assert.ok(mobileAfter[0] < mobileBefore[0] - 1.5, 'Touch joystick did not move the player');
  await mobile.getByRole('button',{name:'Pause exploration'}).tap();
  await mobile.getByRole('button',{name:/^Gallery/}).tap();
  await mobile.getByRole('button',{name:'Visit this frame',exact:true}).nth(3).tap();
  await mobile.getByRole('button',{name:'Continue walking',exact:true}).tap();
  await mobile.locator('.museum-interact').waitFor();
  await mobile.screenshot({path:`${out}/museum-mobile-frame.png`});
  await mobile.locator('.museum-interact').tap();
  await mobile.getByRole('dialog',{name:'CCL1-PawsUp',exact:true}).waitFor();
  await mobile.screenshot({path:`${out}/museum-mobile-project.png`});
  assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile page overflows horizontally');
  report.mobile = {movementBefore:mobileBefore,movementAfter:mobileAfter,touchProjectOpened:true,noHorizontalOverflow:true};
  console.log('Mobile touch walkthrough: passed');
  await mobile.close();

  const fallback = await browser.newPage({viewport:{width:1000,height:800}});
  observe(fallback);
  await fallback.route('**/museum/museum.glb', (route) => route.fulfill({status:503,body:'Unavailable'}));
  await fallback.goto(base + '/museum');
  await fallback.getByRole('alert').waitFor();
  await fallback.getByRole('button',{name:'Browse the projects',exact:true}).click();
  await fallback.getByRole('button',{name:'Read about Pat Pat',exact:true}).click();
  assert.equal(await fallback.getByRole('link',{name:'Explore project',exact:true}).getAttribute('href'), expected[0][1]);
  await fallback.getByRole('button',{name:'Close dialog',exact:true}).click();
  await fallback.unroute('**/museum/museum.glb');
  await fallback.getByRole('button',{name:'Try again',exact:true}).click();
  await waitReady(fallback);
  report.failureRecovery = {galleryWorksWithoutModel:true,retryLoadsModel:true};
  console.log('Loading failure and recovery: passed');
  await fallback.close();
  const unsupported = await browser.newPage();
  await unsupported.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (String(type).includes('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  await unsupported.goto(base + '/museum');
  await unsupported.getByRole('alert').waitFor();
  await unsupported.getByRole('button',{name:'Browse the projects',exact:true}).click();
  assert.equal(await unsupported.locator('.museum-project-grid article').count(), 6);
  report.failureRecovery.webglUnavailableGallery = true;
  await unsupported.close();
  assert.deepEqual(report.pageErrors, []);
  assert.deepEqual(report.graphicsErrors, []);
} finally {
  await writeFile(`${out}/browser-check.json`, JSON.stringify(report,null,2));
  await browser.close();
}
console.log(JSON.stringify(report,null,2));
