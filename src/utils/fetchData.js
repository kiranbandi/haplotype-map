/*global $ */
import axios from 'axios';
import processFile from './processFile';
import toastr from './toastr';

var fetchData = {};

fetchData.getGenomicsData = function(hapmapFile) {

    return new Promise((resolve, reject) => {
        // get the coordinate file
        axios.get(hapmapFile)
            // process the coordinate file 
            .then((response) => { return processFile(response.data) })
            .then((data) => { resolve(data) })
            // if there is an error  reject the promise and let user know through toast
            .catch((err) => {
                toastr["error"]("Failed to fetch and parse required input files", "ERROR");
                reject();
            })
    });
}

module.exports = fetchData;