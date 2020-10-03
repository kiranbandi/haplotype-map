/*global $ */
import axios from 'axios';
import processHapmap from './processHapmap';
import processCNV from './processCNV';
import toastr from './toastr';

var fetchData = {};

fetchData.getHapmapFile = function(hapmapFile) {
    return new Promise((resolve, reject) => {
        // get the coordinate file
        axios.get(hapmapFile)
            // process the coordinate file 
            .then((response) => { return processHapmap(response.data) })
            .then((data) => { resolve(data) })
            // if there is an error  reject the promise and let user know through toast
            .catch((err) => {
                toastr["error"]("Failed to fetch and parse required input files", "ERROR");
                reject();
            })
    });
}

fetchData.getCNVFile = function(cnvFile) {
    return new Promise((resolve, reject) => {
        // get the coordinate file
        axios.get(cnvFile)
            // process the coordinate file 
            .then((response) => { return processCNV(response.data) })
            .then((data) => { resolve(data) })
            // if there is an error  reject the promise and let user know through toast
            .catch((err) => {
                toastr["error"]("Failed to fetch and parse required input files", "ERROR");
                reject();
            })
    });
}

module.exports = fetchData;