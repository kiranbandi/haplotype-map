import cnvWorker from "../workers/cnv.worker";
import toastr from './toastr';

export default function(rawData) {
    return new Promise((resolve, reject) => {
        var instance = cnvWorker();
        instance.process(rawData).catch(() => {
            toastr["error"]("Error in parsing the cnv data file", "ERROR");
            reject();
            instance.terminate();
        }).then(data => {
            resolve(data);
            instance.terminate();
        })
    })
}