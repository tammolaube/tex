var stream = require('stream')
  , util = require('util')
  , LINE_BREAKS = /\r?\n|\r(?!\n)/gi
  , COMMENTS = /(\\)?%.*/g;

module.exports.ClearStream = ClearStream;

function ClearStream() {
    this.writable = true;
    this.readable = true;
}

util.inherits(ClearStream, stream.Stream);

ClearStream.prototype.write = function(chunk) {
    this.emit("data", clearChunkForTex(chunk));
}

ClearStream.prototype.end = function(chunk) {
    if (chunk) {
        this.emit("data", clearChunkForTex(chunk));
    }
    this.emit("end");
}

function clearChunkForTex(chunk) {
    return new Buffer(clearLineBreaks(clearTexComments(chunk.toString())));
}

function clearTexComments(string) {
    return string.replace(COMMENTS, function($0, $1){
        return $1 ? $0 : ' ';
    });
}

function clearLineBreaks(string) {
    return string.replace(LINE_BREAKS, ' ');
}
