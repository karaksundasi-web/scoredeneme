// quick look: renders frames of film.html at given seconds (half size) and evaluates an expression
const { chromium } = require('playwright');
(async () => {
  const [ts, expr] = [process.argv[2] || '', process.argv[3] || ''];
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + process.cwd() + '/film.html?w=540&h=960');
  await p.evaluate(() => window.READY);
  if (expr) console.log(await p.evaluate(expr));
  for (const t of ts.split(',').filter(Boolean)) {
    const url = await p.evaluate((f) => window.captureFrame(f, 'image/jpeg', 0.8), Math.round(+t * 30));
    require('fs').writeFileSync(`logs/probe-${t}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close();
})();
