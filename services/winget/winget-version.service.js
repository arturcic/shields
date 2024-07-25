import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const schema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
  }),
)

export default class WingetVersion extends BaseJsonService {
  static category = 'version'

  static route = { base: 'winget/v', pattern: ':packageId' }

  static openApi = {
    '/winget/v/{packageId}': {
      get: {
        summary: 'winget version',
        parameters: pathParams({
          name: 'packageId',
          example: 'Git.Git',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'winget' }

  async fetch({ packageId }) {
    const [publisher, ...packageParts] = packageId.split('.')
    const packageName = packageParts.join('.')
    const group = publisher.charAt(0).toLowerCase()
    return this._requestJson({
      schema,
      url: `https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/${group}/${publisher}/${packageName}`,
    })
  }

  async handle({ packageId }) {
    const data = await this.fetch({ packageId })

    if (data.length === 0) {
      throw new NotFound({ prettyMessage: 'package not found' })
    }

    // Extract version names
    const versions = data.map(item => item.name)

    // Sort versions and get the latest
    versions.sort()
    versions.reverse()

    return renderVersionBadge({ version: versions[0] })
  }
}
