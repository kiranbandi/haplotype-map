/*global $ */
import axios from 'axios';
import processFile from './processFile';

var fetchData = {};

fetchData.getAndProcessFile = function(filepath, fileType) {
    return new Promise((resolve, reject) => {
        // get the file
        axios.get(filepath, { headers: { 'content-encoding': 'gzip' } })
            // process the file based on its type 
            .then((response) => { return processFile(response.data, fileType) })
            .then((data) => { resolve(data) })
            // if there is an error  reject the promise and let user know through toast
            .catch((err) => {
                alert("Failed to fetch and parse the " + fileType + ' file', "ERROR");
                reject();
            })
    });
}

fetchData.getFile = function(filepath, fileType) {
    return new Promise((resolve, reject) => {
        // get the file
        axios.get(filepath, { headers: { 'content-encoding': 'gzip' } })
            .then((response) => { resolve(response.data) })
            // if there is an error  reject the promise and let user know through toast
            .catch((err) => {
                alert("Failed to fetch the" + fileType + ' file', "ERROR");
                reject();
            })
    });
}

module.exports = fetchData;