const path = require('path');
const fs = require('fs-extra');

async function walk(dir, dirName = "") {
    
    const dirEntries = await fs.readdir(dir, { withFileTypes: true });
    
    const files = await Promise.all(dirEntries.map((dirEntry) => {

        const fullPath = path.resolve(dir, dirEntry.name);
        const relativePath = dirName + "/" + dirEntry.name;

        if(dirEntry.isDirectory()){
            return walk(fullPath, relativePath)
        }
        else {
            return {
                Path: fullPath,
                Size: fs.statSync(fullPath).size,
                Key: relativePath
            };
        }

    }));

    return Array.prototype.concat(...files);
}

module.exports.dirToKeys = walk;