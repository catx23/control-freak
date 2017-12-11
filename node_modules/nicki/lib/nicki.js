'use strict';

const fs = require('fs');

const ischanged = require('ischanged');
const FILE = '/etc/passwd';

const DARWIN = process.platform === 'darwin';

let Names;

module.exports = (callback) => {
    if (DARWIN) {
        if (Names)
            return callback(null, Names);
       
        require('./darwin')((error, data) => {
            Names = data;
            callback(error, data);
        });
    } else {
        ischanged(FILE, (error, is) => {
            if (error)
                return callback(error);
            
            if (is || !Names)
                return read(callback);
            
            callback(null, Names);
        });
    }
};

module.exports.parse = get;

function read(callback) {
    fs.readFile(FILE, 'utf8', (error, passwd) => {
        if (!error)
            Names = get(passwd);
        
        callback(error, Names);
    });
}


/** Функция парсит uid и имена пользователей
 * из переданного в строке вычитаного файла /etc/passwd
 * и возвращает массив обьектов имён и uid пользователей
 * @param passwd - строка, в которой находиться файл /etc/passwd
 */
function get(passwd) {
    const users   = {};
    
    passwd
        .split('\n')
        .forEach((line) => {
            passwd = passwd.replace(line, '');
            
            /* получаем первое слово строки */
            const name = line.substr(line, line.indexOf(':'));
            
            line = line.replace(name + ':x:', '');
            
            /* получаем uid */
            const uid = line.substr(line, line.indexOf(':'));
            
            if (!uid)
                return;
            
            users[uid] = name;
        });
    
    return users;
}

