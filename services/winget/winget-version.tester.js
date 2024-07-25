import { createServiceTester } from '../tester.js'
import { isVPlusDottedVersionNClauses } from '../test-validators.js'

export const t = await createServiceTester()

t.create('winget (valid)').get('/Git.Git.json').expectBadge({
  label: 'winget',
  message: isVPlusDottedVersionNClauses,
})

t.create('winget (valid)')
  .get('/Git.Git.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/microsoft/winget-pkgs/contents/manifests/g/Git/Git')
      .reply(200, [{ name: '2.45.2' }]),
  )
  .expectBadge({ label: 'winget', message: 'v2.45.2' })

t.create('winget (not found)')
  .get('/unknown.package.json')
  .expectBadge({ label: 'winget', message: 'not found' })
