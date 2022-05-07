'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;

const gitFormat = '{%n  "commit": "%H",%n  "short_commit": "%h",%n  "refs": "%D",%n  "author": "%aN"%n}';

async function versionPackage(pkgFile, flags) {
  const commit = {};

  if (flags.data) {
    commit.data = flags.data;
  }

  if (flags['add-commit']) {
    const output = execSync(`git log -n 1 '--pretty=format:${gitFormat}'`).toString();
    try { Object.assign(commit, JSON.parse(output)); } catch (e) { }
  }

  const pkgContent = JSON.parse(fs.readFileSync(pkgFile).toString());

  const build = Number.parseInt(pkgContent.version.split('.').pop());
  const version = pkgContent.version.replace(/\d+$/, build + 1);

  console.log(`version updated to ${version}`);

  pkgContent.version = version;
  fs.writeFileSync(pkgFile, JSON.stringify(pkgContent, null, 2));
}

module.exports = versionPackage;