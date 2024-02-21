var serviceUrl = 'http://localhost:4000/api/';


const sendRequestWithToken = (httpMethod, token, arrayData, route, callback) => {
    let data = JSON.stringify(arrayData);
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.onload = () => {

        if (xhr.readyState == 4 && xhr.status == "200") {
            callback(xhr, false);
        } else {
            if (xhr.status == "401") {
                window.location.replace("../home");
            }
            callback(xhr, true);
        }
    }
    //alert(serviceUrl+route);
    xhr.open(httpMethod, serviceUrl + route, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Authorization", token);
    xhr.send(data);
}
const sendFormWithToken = (httpMethod, token, data, route, callback) => {

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.onprogress = function (e) {
        if (e.lengthComputable) {
            console.log(e.loaded + " / " + e.total)
        }
    }
    xhr.onloadstart = function (e) {
        console.log("start")
    }
    xhr.onloadend = function (e) {
        console.log("end")
    }
    xhr.onload = () => {

        if (xhr.readyState == 4 && xhr.status == "200") {
            callback(xhr, false);
        } else {
            if (xhr.status == "401") {
                window.location.replace("../home");
            }
            callback(xhr, true);
        }
    }
    //alert(serviceUrl+route);
    xhr.open(httpMethod, serviceUrl + route, true);
    //xhr.setRequestHeader("Content-Type","multipart/form-data;charset=UTF-8");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Authorization", token);
    xhr.send(data);
}