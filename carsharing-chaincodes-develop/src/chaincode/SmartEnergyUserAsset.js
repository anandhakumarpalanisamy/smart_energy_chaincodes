'use strict';

const assert = require('assert');

let user = {
    docType: String,
    userId: String,
    userName: String,
    capacity: Number,
    selling: Number,
    reserverPower: Number,
    minSellingThreshold: Number,
    source: String,
    postText: String,
    price: Number
};

class SmartEnergyUserAsset {

    // Car status: 0 = Ok, 1 = notOk, 2 = notChecked

    async create(userId, userName, capacity, source, selling, postText, price,reserverPower, minSellingThreshold) {
        assert(userId, 'userId not must be undefined');
        assert(userName, 'userName not must be undefined');
        assert(capacity, 'capacity not must be undefined');
        assert(source, 'source not must be undefined');
        assert(selling, 'selling not must be undefined');
        assert(postText, 'postText of enrollment not must be undefined');
        assert(price, 'price not must be undefined');
        assert(reserverPower, 'reserverPower not must be undefined');
        assert(minSellingThreshold, 'minSellingThreshold not must be undefined');
        assert.equal(isNaN(selling), false, 'selling must be a number');
        assert.equal(isNaN(price), false, 'price of enrollment must be a number');
        assert.equal(isNaN(capacity), false, 'capacity must be a number');
        assert.equal(isNaN(reserverPower), false, 'reserverPower must be a number');
        assert.equal(isNaN(minSellingThreshold), false, 'minSellingThreshold must be a number');
        

        user.docType = 'user';
        user.userId = userId;
        user.userName = userName;
        user.capacity = parseInt(capacity);
        user.selling = parseInt(selling);
        user.reserverPower = parseInt(reserverPower);
        user.minSellingThreshold = parseInt(minSellingThreshold);
        user.postText = postText;
        user.price = parseInt(price);
        

        return user;
    }

    async edit(userId, userName, capacity, source, selling, postText, price,reserverPower, minSellingThreshold) {
        assert(userId, 'userId not must be undefined');
        assert(userName, 'userName not must be undefined');
        assert(capacity, 'capacity not must be undefined');
        assert(source, 'source not must be undefined');
        assert(selling, 'selling not must be undefined');
        assert(postText, 'postText of enrollment not must be undefined');
        assert(price, 'price not must be undefined');
        assert(reserverPower, 'reserverPower not must be undefined');
        assert(minSellingThreshold, 'minSellingThreshold not must be undefined');
        assert.equal(isNaN(selling), false, 'selling must be a number');
        assert.equal(isNaN(price), false, 'price of enrollment must be a number');
        assert.equal(isNaN(capacity), false, 'capacity must be a number');
        assert.equal(isNaN(reserverPower), false, 'reserverPower must be a number');
        assert.equal(isNaN(minSellingThreshold), false, 'minSellingThreshold must be a number');
        
        user.docType = 'user';
        user.userId = userId;
        user.userName = userName;
        user.capacity = parseInt(capacity);
        user.selling = parseInt(selling);
        user.reserverPower = parseInt(reserverPower);
        user.minSellingThreshold = parseInt(minSellingThreshold);
        user.postText = postText;
        user.price = parseInt(price);

        return user;
    }

    // async deleteCar(car, notDeleted){

    //     assert(car, 'Car cannot be undefined');
    //     assert(notDeleted, 'Not deleted state cannot be undefined');

    //     if(notDeleted == "true"){
    //         car.notDeleted = true;
    //     }else{
    //         car.notDeleted = false;
    //     }

    //     return car;
    // }

}

module.exports = {
    SmartEnergyUserAsset
};