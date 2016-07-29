const electron = require('electron');
const {app} = electron;
const arrayConversion = require('./arrayConversion');


const DataStore = require('nedb')
    , db = new DataStore({
    filename: app.getPath('userData') + '/database/regel.db',
    autoload: true
});

function findAll(conditions = {}, callback) {
    db.find(conditions, (error, docs) => {
        if (error) {
            console.log(error);
        }
        callback(docs);
    });
}

function getNextId(callback) {
    db.findOne().sort({_id: -1}).exec((error, doc) => {
            if (error) {
                console.log(error);
            }
            if (doc && doc._id) {
                callback(parseInt(doc._id) + 1);
            } else {
                callback(1);
            }
        }
    );
}

function create(data, callback = () => {
}) {
    getNextId((id) => {
            data._id = id;
            db.insert(data, (error, newDoc) => {
                    if (error) {
                        console.log(error);
                    }
                    callback(newDoc);
                }
            );
        }
    );
}

function update(data, where = {}, callback = () => {
}) {
    let id = Number(data._id);
    if (id) {
        delete data._id;
        db.update({_id: id}, {$set: data}, {returnUpdatedDocs: true}, (error, numAffected, affectedDocuments) => {
            callback(error, numAffected, affectedDocuments);
        });
    } else {
        db.update(where, {$set: data}, {}, (error, numAffected, affectedDocuments) => {
            callback(error, numAffected, affectedDocuments)
        });
    }
}

/**
 *
 * @type {findAll}
 */
module.exports.findAll = findAll;

/**
 *
 * @type {create}
 */
module.exports.create = create;

/**
 *
 * @type {update}
 * @param {{}} data
 * @param {{}} where
 * @param {function} callback
 */
module.exports.update = update;