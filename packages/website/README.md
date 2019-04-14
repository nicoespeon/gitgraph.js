# Source code of Gitgraph.js website

The website is generated from [mdx-deck][mdx-deck].

Few commands available (with yarn):

- `yarn start` to run the website locally
- `yarn deploy` to deploy the website online

## About dependencies versions

For the moment, [it's not possible to embed both mdx-deck-code-surfer and mdx-deck-live-code](https://github.com/pomber/code-surfer/issues/49). Also, both libraries don't work well with mdx-deck v2.

Thus, we decided to go with mdx-deck-code-surfer only, and mdx-deck v1.

[mdx-deck]: https://github.com/jxnblk/mdx-deck/
