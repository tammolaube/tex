var path = require('path'),    
    EXTENSIONS = {
        TEX : 'tex',
        LOG : 'log',
        PDF : 'pdf',
        DVI : 'dvi'
    },
    PROGRAMS = {
        PDFLATEX : {
            command : 'pdflatex',
            extension : EXTENSIONS.PDF
        },
        TEX : {
            command : 'tex',
            extension : EXTENSIONS.DVI
        },
        LATEX : {
            command : 'latex',
            extension : EXTENSIONS.DVI
        },
        BIBTEX : {
            command : 'bibtex'
        },
        MKINDEX : {
            command : 'mkindex'
        }
    },
    // Job default options
    DEFAULTS = {
        program : PROGRAMS.PDFLATEX,
        outputDir : '/tmp/node-latex/out',
        status : {
            code : 0,
            done : false,                
            message : 'Initial.',
            success : ''
        },
        getFileName : getFileName,
        getInputFileName : getInputFileName,
        getOutputFileName : getOutputFileName,
        getOutputFilePath : getOutputFilePath,
        getLogFilePath : getLogFilePath
    };

function getInputFileName () {
    return path.basename(this.inputFilePath);
}

function getOutputFileName () {
    return (this.program.extension) ? addExtension(this.jobName, this.program.extension) : '';
}

function getOutputFilePath () {
    return (this.program.extension) ? joinFilePath.call(this, this.program.extension) : '';
}

function getLogFilePath () {
    return joinFilePath.call(this, EXTENSIONS.LOG); 
}

function joinFilePath(extension) {
    return path.join(this.outputDir, addExtension(this.jobName, extension)); 
}

function getFileName(extension) {
    return addExtension(this.jobName, extension);
}

function addExtension(name, extension) {
    return (extension) ? (name + '.' + extension) : name;
}

// Safely merges the new options or the defaults into the job
function setOptions (job, options) {
    options = options || {};
    for (var attr in DEFAULTS) {
        job[attr] = options[attr] || DEFAULTS[attr];
        delete options[attr];
    }
    for (var attr in options) {
        job[attr] = options[attr];
    }
    return job;
}

// Latex job constructor
function Job(inputFilePath, options) {
    if (!inputFilePath) {
        throw new Error('Illegal Argument: An inputFilePath must be specified!');
    }

    this.inputFilePath = inputFilePath || '';
    this.jobName = path.basename(this.inputFilePath, addExtension('', EXTENSIONS.TEX));

    setOptions(this, options);
}


module.exports.PROGRAMS = PROGRAMS;
module.exports.newJob = function job (inputFilePath, options) {
    return new Job(inputFilePath, options);
};
