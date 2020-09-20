import compareWorker from "../workers/compare.worker";
import toastr from './toastr';

export default function(lineData, sourceLine, TargetLines) {
    return new Promise((resolve, reject) => {
        var instance = compareWorker();
        instance.process(lineData, sourceLine, TargetLines).catch(() => {
            toastr["error"]("Error in comparing germplasm lines", "ERROR");
            reject();
            instance.terminate();
        }).then(data => {
            resolve(data);
            instance.terminate();
        })
    })
}