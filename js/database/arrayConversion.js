/**
 *
 * @param {array} array formatted [{description:'description', name:'name'}]
 * @return {{}} formatted [description: 'name']
 */
function arrayToObject(array) {
    const object = {};
    for (let item of array) {
        console.log(item);
        const description = item.name;
        object[description] = item.value;
    }
    console.log(object);
    return object;
}

/**
 *
 * @param object
 */
function objectToArray(object) {
    const array = [];
    for (let key in object) {
        if (object.hasOwnProperty(key)) {
            array.push({name: key, value: object[key]});
        }
    }
    console.log(array);
    return array;
}

module.exports.arrayToObject = arrayToObject;
module.exports.objectToArray = objectToArray;