# NPM Publish Action

This action will allow you to publish multiple packages to multiple registries.
And it also support publish your monorepo packages by default.


```yaml
- name: publish
  uses: action-runner/npm-publish
  with:
    tokens: |
      ${{ secrets.NPM_TOKEN }}
      ${{ secrets.GITHUB_TOKEN}}
    packageFiles: |
      package.json
    registries: |
      https://registry.npmjs.org/
      https://npm.pkg.github.com
```