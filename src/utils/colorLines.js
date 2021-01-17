import colorWorker from "../workers/color.worker";
export default function (lineData, TargetLines, colorScheme = 'difference') {
    return new Promise((resolve, reject) => {
        var instance = colorWorker();
        instance.process(lineData, TargetLines, colorScheme).catch(() => {
            alert("Error in comparing/colouring germplasm lines");
            reject();
            instance.terminate();
        }).then(data => {
            resolve(data);
            instance.terminate();
        })
    })
}