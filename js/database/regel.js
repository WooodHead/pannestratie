const electron                     = require('electron');
const {app, ipcMain}               = electron;

const main  = require('../../main');
const {win} = main;

const DataStore = require('nedb')
    , db        = new DataStore({
    filename: app.getPath('userData') + '/database/regel.db',
    autoload: true
});

/**
 *
 * @param conditions
 * @param callback
 */
function findAll(conditions = {}, callback) {
    if (conditions.hasOwnProperty("category") && conditions.category.hasOwnProperty("$regex")) {
        conditions.category.$regex = new RegExp(conditions.category.$regex);
    }
    db.find(conditions).sort({date: 1}).exec((error, docs) => {
        if (error) {
            console.log(error);
        }
        callback(docs);
    });
}

/**
 *
 * @param callback
 */
function getNextId(callback) {
    db.findOne().sort({_id: -1}).exec((error, doc) => {
            if (error) {
                console.log(error);
            }
            if (doc && doc._id) {
                callback(parseInt(doc._id) + 1);
            } else {
                ipcMain.once("prompt", (event, value) => {
                    callback(parseInt(value));
                });
                win().webContents.send("prompt", "Geef het startnummer op");
            }
        }
    );
}

/**
 *
 * @param data
 * @param callback
 */
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

/**
 *
 * @param data
 * @param where
 * @param callback
 */
function update(data, where = {}, callback = () => {
}) {
    let id = Number(data._id);
    if (id) {
        delete data._id;
        db.update({_id: id}, {$set: data}, {returnUpdatedDocs: true}, (error, numAffected, affectedDocuments) => {
            if (error) {
                console.log(error);
            }
            callback(null, numAffected, affectedDocuments);
        });
    } else {
        db.update(where, {$set: data}, {}, (error, numAffected, affectedDocuments) => {
            if (error) {
                console.log(error);
            }
            callback(null, numAffected, affectedDocuments)
        });
    }
}

function remove(where, callback = () => {
}) {
    db.remove(where, {}, (error, numRemoved, id) => {
        if (error) {
            console.log(error);
        }
        callback(numRemoved, id);
    });
}

/**
 *
 * @type {findAll}
 */
module.exports.findAll = findAll;

/**
 *
 * @type {create}
 * @param {{}} data
 * @param {function} callback
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

/**
 *
 * @type {remove}
 * @param {{}} where
 * @param {function} callback
 */
module.exports.remove = remove;