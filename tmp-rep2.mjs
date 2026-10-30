import { chromium } from 'playwright'
const b = await chromium.launch()
for (const [w,tag] of [[390,'390'],[320,'320']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:1000}, deviceScaleFactor:2 })
  const page = await ctx.newPage()
  await page.goto('http://127.0.0.1:5174/login', { waitUntil:'networkidle' })
  await page.fill('input[type=email]', 'landing@carcheck.test')
  await page.fill('input[type=password]', 'landing-demo')
  await page.click('button[type=submit]')
  await page.waitForURL(u => !u.pathname.includes('login'), { timeout: 15000 })
  await page.goto('http://127.0.0.1:5174/reportes', { waitUntil:'networkidle' })
  await page.waitForTimeout(800)
  const m = await page.evaluate(() => ({ table: document.querySelector('table')?.getBoundingClientRect().width, wrap: document.querySelector('[role=region]')?.getBoundingClientRect().width }))
  console.log(tag, JSON.stringify(m))
  const sec = page.locator('section').nth(3)
  await sec.screenshot({ path:`/tmp/opencode/rep2-${tag}.png` })
  await ctx.close()
}
await b.close()
