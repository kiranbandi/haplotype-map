import hapmapWorker from "../workers/hapmap.worker";
import toastr from './toastr';

export default function(rawData) {
    return new Promise((resolve, reject) => {
        var instance = hapmapWorker();
        instance.process(rawData).catch(() => {
            toastr["error"]("Error in parsing the input data file", "ERROR");
            reject();
            instance.terminate();
        }).then(data => {
            resolve(data);
            instance.terminate();
        })
    })
}