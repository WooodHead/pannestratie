const electron = require('electron');
const {app} = electron;
const arrayConversion = require('./arrayConversion');


const DataStore = require('nedb')
    , db = new DataStore({
    filename: app.getPath('userData') + '/database/regel.db',
    autoload: true
});

class Regel {

    constructor(params) {
        console.log(params);
    }

    /**
     *
     * @return {DataStore}
     */
    static getDb() {
        if(!Regel.db) {
            Regel.db = new DataStore({
                filename: app.getPath('userData') + '/databases/regel.db',
                autoload: true
            });
        }

        return Regel.db;
    }

    store() {
        const db = Regel.getDb();
        db.update({_id: this._id}, this, {upsert: true,returnUpdatedDocs:true}, (error, numAffected, affectedDocuments, upsert) => {
            if (error) {
                console.log(error);
            }

            console.log(numAffected, affectedDocuments, upsert);
        })
    }

    /**
     *
     */
    static find(conditions, callback) {
        const db = Regel.getDb();
        db.findOne(conditions, callback);
    }

    /**
     *
     * @param {integer} id
     * @param {()} callback
     */
    static findById(id, callback) {
        return Regel.find({_id: id}, callback);
    }
}

const regelA = new Regel();
regelA._id = 1;
regelA.name = "test";
regelA.store();
console.log(regelA);
const testRegel = Regel.findById(1, (error, doc) => {
    console.log("Document:",doc);
});

/**
 *
 * @param conditions
 * @param callback
 */
function findAll(conditions = {}, callback) {
    db.find(conditions, (error, docs) => {
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
                callback(1);
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