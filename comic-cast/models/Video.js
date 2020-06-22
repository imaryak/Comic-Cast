const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    name: {type: 'string'},
    genre:{type:'string',enum:['Anecdotal','Dark','Deadpan','Improv','Observational','Wit','Satire']},
    description:{type:'string'},
    videoLink:{type:'string',unique:true}
});

const Video = mongoose.model('Video', VideoSchema);

module.exports = Video;