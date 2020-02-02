module.exports.pause = async function (timeout) {
    return new Promise(res => setTimeout(res, timeout));
}