var 
    path = require('path'),    
    COMMANDS = {
        PDFLATEX : 'pdflatex',
        TEX : 'tex',
        LATEX : 'latex'        
    },
    EXTENSIONS = {
        TEX : '.tex',
        LOG : '.log',
        PDF : '.pdf',
        DVI : '.dvi'
    },
    PROGRAMS = {
        PDFLATEX : {
            command : COMMANDS.PDFLATEX,
            extension : EXTENSIONS.PDF
        },
        TEX : {
            command : COMMANDS.TEX,
            extension : EXTENSIONS.DVI
        },
        LATEX : {
            command : COMMANDS.LATEX,
            extension : EXTENSIONS.DVI
        }
    },
    // Job default options
    DEFAULTS = (function () {
        var 
            program = PROGRAMS.PDFLATEX,
            outputDir = '/tmp/node-latex/out',
            done = 'false',
            success = undefined,
            message = 'Initial.',
            
            // private
            jobName = undefined
        ;

        function getInputFileName () {
            return path.basename(inputFilePath);
        }

        function getJobName () {
            var ret = jobName || path.basename(inputFilePath, EXTENSIONS.TEX);        
            return ret;
        }

        function getOutputFilePath () {
            return joinFilePath(program.extension);
        }

        function getLogFilePath () { 
            return joinFilePath(EXTENSIONS.LOG); 
        }

        function setJobName (name) { 
            jobName = name; 
        }

        // private
        function joinFilePath(extension) {
            return path.join(outputDir, getJobName() + extension); 
        }

        return {
            program : program,
            outputDir : outputDir,            
            getInputFileName : getInputFileName,
            getJobName : getJobName,
            getOutputFilePath : getOutputFilePath,
            getLogFilePath : getLogFilePath,
            setJobName : setJobName,
            status : {
                done : done,
                message : message,
                success : success
            }
        }
    })()
;

// Safely merges the new options or the defaults into the job
function setOptions (job, options) {
    options = options || {};
    // Set only attributes that are available public in DEFAULTS
    for (var attr in DEFAULTS) {
        job[attr] = options[attr] || DEFAULTS[attr];
    }
    // Set private attribute(s)
    job.setJobName(options.jobName);
    return job;
}

// Latex job constructor
function Job(inputFilePath, options) {
    if (!!inputFilePath) {
        throw new Error('An inputFilePath must be defined!');
    }    

    this.inputFilePath = inputFilePath || '';
    setOptions(this, options);
}

module.exports.PROGRAMS = PROGRAMS;
module.exports.newJob = function job (inputFilePath, options) { 
    return new Job(inputFilePath, options);
};
