// Latex job default options
var DEFAULTS = {
    command : 'pdflatex',
    outputDir : '/tmp/node-latex/out',
    outputFileName : undefined,
    done : 'false',
    success : undefined,
    message : 'Before print.',
    getInputFileName : function () {
        var fileName = '';        
        if (typeof this.inputFilePath === 'string') {
            fileName = this.inputFilePath.substr(this.inputFilePath.lastIndexOf('/') + 1);
        }
        return fileName;
    },
    getOutputFilePath : function () { 
        return this.outputDir + '/' + this.outputFileName 
    }
};

// Safely merges the new options or the defaults into the job
function setOptions (job, options) {
    options = options || {};
    // Set only attributes that are available in DEFAULTS
    for (var attr in DEFAULTS) {
        job[attr] = options[attr] || DEFAULTS[attr];
    }
    return job;
}

// Latex job constructor
function Job(inputFilePath, options) {
    this.inputFilePath = inputFilePath;
    setOptions(this, options);
}

module.exports.newJob = function job (inputFilePath, options) { 
    return new Job(inputFilePath, options);
};
