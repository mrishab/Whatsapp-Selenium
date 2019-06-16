const fs = require('fs');
const path = require('path');

module.exports = {
    getFilenames: getFilenames,
    renameFile: renameFile,
    getRandomItem: getRandomItem,
    readArgs: readArgs
};

async function getFilenames(dirPath) {
    return new Promise((resolve, reject) => {
        let callback = function (err, files) {
            if (err) {
                return reject(err);
            } else {
                resolve(files);
            }
        }
        fs.readdir(dirPath, callback);
    });
}

async function renameFile(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        let callback = function (err) {
            if (err) throw err;
            else resolve();
        }
        fs.rename(oldPath, newPath, callback);
    });
}

function getRandomItem(list, start = 0, end = list.length) {
    return list[getRandomInt(start, end)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function readArgs() {
    let rawArgs = process.argv.slice(2);
    const minimist = require('minimist');
    return minimist(rawArgs);
}