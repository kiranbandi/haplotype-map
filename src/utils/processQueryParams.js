export default function() {
    let query = window.location.search;
    if (query.indexOf('source') == -1) {
        return {};
    } else {
        return (/^[?#]/.test(query) ? query.slice(1) : query)
            .split('&')
            .reduce((params, param) => {
                let [key, value] = param.split('=');
                params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                return params;
            }, {});
    }
};