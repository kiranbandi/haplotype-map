import cnvWorker from "../workers/cnv.worker";
import hapmapWorker from "../workers/hapmap.worker";
import gff3Worker from "../workers/gff3.worker";

export default function(rawData, typeOfFile) {
    return new Promise((resolve, reject) => {
        var instance;
        switch (typeOfFile) {
            case 'cnv':
                instance = cnvWorker();
                break;
            case 'hapmap':
                instance = hapmapWorker();
                break;
            case 'gff3':
                instance = gff3Worker();
                break;
        }
        instance.process(rawData).catch(() => {
            alert("Error in parsing the " + typeOfFile + " file");
            reject();
            instance.terminate();
        }).then(data => {
            resolve(data);
            instance.terminate();
        })
    })
}