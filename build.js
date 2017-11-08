const metalsmith = require('metalsmith')
const layouts = require('metalsmith-layouts')
const inPlace = require('metalsmith-in-place')
const watch = require('metalsmith-watch')
const drafts = require('metalsmith-drafts')
const collections = require('metalsmith-collections')
const collectionMetadata = require('metalsmith-collection-metadata')
const when = require('metalsmith-if')
const posixPath = require('metalsmith-posix-path')
const jsonMetadata = require('metalsmith-json-metadata')
const feed = require('metalsmith-feed')
const sitemap = require('metalsmith-sitemap')
const posthtml = require('metalsmith-posthtml')

const config = {
  url: 'http://example.com/'
}

let watches = false

process.argv.forEach((val, index) => {
  if (val === '--watch') watches = true
})

metalsmith(__dirname)
  .metadata({
    site: {
      name: 'Skeleton Metalsmith',
      url: config.url,
      author: 'auhtor',
      description: 'Hello, world!'
    },
    moment: require('moment')
  })
  .source('src/html')
  .destination('doc')
  .use(drafts())
  .use(collections({
    blog: {
      pattern: 'blog/*/index.*',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(collectionMetadata({
    'collections.blog': {
      layout: 'blog/post.pug'
    }
  }))
  .use(posixPath({
    property: 'path'
  }))
  .use(jsonMetadata())
  .use(feed({
    collection: 'blog',
    limit: 10,
    destination: 'blog/feed.xml'
  }))
  .use(sitemap({
    hostname: config.url,
    urlProperty: 'path',
    pattern: '**/*.{html,pug}'
  }))
  .use(inPlace())
  .use(layouts({
    engine: 'pug',
    partials: 'src/partials',
    directory: 'src/layouts'
  }))
  .use(posthtml())
  .use(when(
    watches,
    watch({
      paths: {
        '${source}/**/*': true,
        'src/layouts/**/*': '**/*'
      }
    })
  ))
  .build((err) => {
    if (err) throw err;

    console.log('Site build complete!!')
  })
