'use strict';

const fs = require('fs');
const crypto = require('crypto');
const execSync = require('child_process').execSync;
const autonum = require("bent")("https://autonum.app", "POST", "json", 200);

const gitFormat = '{%n  "commit": "%H",%n  "short_commit": "%h",%n  "refs": "%D",%n  "author": "%aN"%n}';

async function versionPackage(pkgFile, flags) {
  const commit = {};
  
  if (flags.data) {
    commit.data = flags.data;
  }

  if (flags['add-commit']) {
    const output = execSync(`git log -n 1 '--pretty=format:${gitFormat}'`).toString();
    try { Object.assign(commit, JSON.parse(output)); } catch(e) { }
  }

  const pkgContent = JSON.parse(fs.readFileSync(pkgFile).toString());
  
  if (!flags.secret) {
    const md5sum = crypto.createHash('md5');
    md5sum.update(`${pkgContent.name}${pkgContent.author}${pkgContent.author}`);
    flags.secret = md5sum.digest('base64');
  }

  const pkgKey = `${pkgContent.name}-${flags.secret}`.replace(/[^a-z0-9]+/gi, '-');

  const { number } = await autonum(`/v1/next?id=${pkgKey}`, commit);
  const version = pkgContent.version.replace(/\d+$/, number);
  
  console.log({pkgFile, commit, number, version, pkgKey, flags})

  pkgContent.version = version;
  fs.writeFileSync(pkgFile, JSON.stringify(pkgContent, null, 2));
}

module.exports = versionPackage;