var stream = require('stream')
  , util = require('util')
  , StringDecoder = require('string_decoder').StringDecoder;

module.exports.ClearStream = ClearStream;

function ClearStream(pattern, encoding) {
    var encoding = encoding || 'utf8';

    this.writable = true;
    this.readable = true;

    this.pattern = pattern;
    this._decoder = new StringDecoder(encoding);
}

util.inherits(ClearStream, stream.Stream);

ClearStream.prototype.write = function(chunk) {
    var string = this._decoder.write(chunk).replace(this.pattern, '');
    this.emit("data", new Buffer(string, this.encoding));
}

ClearStream.prototype.end = function(chunk) {
    if (chunk) {
        var string = this._decoder.write(chunk).replace(this.pattern, '');
        this.emit("data", new Buffer(string, this.encoding));
    }
    this.emit("end");
}
