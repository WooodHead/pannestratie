const electron = require('electron');
const {app} = electron;
const arrayConversion = require('./arrayConversion');


const DataStore = require('nedb')
    , db = new DataStore({
    filename: app.getPath('userData') + 'database/regel.db',
    autoload: true
});


function findAll(conditions = {}, callback) {
    db.find(conditions, (error, docs) => {
        console.log(error);
        console.log(docs);
        callback(docs);
    });
}

function create(data, callback = () => {
}) {
    data = arrayConversion.arrayToObject(data);
    db.insert(data, (error, newDoc) => {
        console.log(error);
        console.log(newDoc);
        callback(arrayConversion.objectToArray(newDoc));
    });
}


module.exports.findAll = findAll;
module.exports.create = create;