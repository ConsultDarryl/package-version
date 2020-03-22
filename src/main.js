'use strict';

const glob = require('glob');
const versionPackage = require('./versionPackage');

async function main(args) {
    const flags = args.filter(x => x.startsWith('--'))
        .reduce((m, f) => { m[f.substr(2)] = true; return m; }, {});

    const packages = args.filter(x => !x.startsWith('--'))
        .reduce((all, pattern) => [
            ...all,
            ...glob.sync(pattern, { absolute: true, ignore: "**/node_modules/**/package.json" })
        ], []);

    if (!packages.length || flags['help']|| flags['?']) {
        console.log('usage: \n$ autonum ./**/package.json [--add-commit] [--secret=<unique-secret>] [--data=<any string>]\n');
        return;
    }

    for (const pkg of packages) {
        await versionPackage(pkg, { ...flags });
    }
}

main(process.argv.slice(2))
    .then(() => {
        process.exit(0);
    })
    .catch((ex) => {
        console.error('Fatal exception: ' + ex.message + '\n', ex);
        process.exit(1);
    });
