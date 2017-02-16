'use babel';

import { Map } from 'immutable';

import path from 'path';
import fs from 'fs';

function read(p) {
    return new Promise((resolve, reject) => {
        fs.readFile(p, 'utf8', (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

class PackageReader {
    async read(p = process.cwd()) {
        this.cwd = p;
        const file = await read(path.join(p, 'package.json'));
        try {
            this.packageJSON = JSON.parse(file);
            this.scripts = new Map(this.packageJSON.scripts || {});
        } catch (e) {
            console.log(e);
        }

        return this;
    }
}

export default PackageReader;
