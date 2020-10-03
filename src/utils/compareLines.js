import compareWorker from "../workers/compare.worker";
export default function(lineData, TargetLines) {
    return new Promise((resolve, reject) => {
        var instance = compareWorker();
        instance.process(lineData, TargetLines).catch(() => {
            alert("Error in comparing germplasm lines");
            reject();
            instance.terminate();
        }).then(data => {
            resolve(data);
            instance.terminate();
        })
    })
}