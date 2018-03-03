var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: process.env.Elastic_Host,
  log: 'trace'
});

function ElasticRepository() {

}

function ping() {
  client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
  }, function (error) {
    if (error) {
      console.trace('elasticsearch cluster is down!');
    } else {
      console.log('All is well');
    }
  });
}

function search(correlationId, logType, from, to) {
  return client.search({
    index: 'diary-logs',
    type: 'diaryLog',
    q: 'CorrelationId: "' + correlationId + '" AND LogType: "' + logType + '" AND LogDate: ["' + from.toISOString() + '" TO "' + to.toISOString() + '"]'
  });
}

function getData(diaryName, logType, from, to) {
  return client.search({
    index: 'diary-events',
    type: 'diaryEvent',
    q: 'DiaryName: "' + diaryName + '"'
  }).then((diaryEventResponse) => {
    // TODO check if is an error or if there are hits before do that
    if (diaryEventResponse.hits.total === 0) {
      throw { message: "Diary '" + diaryName + "' not found" }
    }
    var correlationId = diaryEventResponse.hits.hits[0]._source.Id;
    return search(correlationId, logType, from, to);
  }).then((diaryLogResponse) => {
    var results = [];
    diaryLogResponse.hits.hits.forEach(element => {
      results.push({
        "Id": element._source.Id,
        "Value": element._source.Value,
        "Mmolvalue": element._source.Mmolvalue,
        "SlowTerapy": element._source.SlowTerapy,
        "FastTerapy": element._source.FastTerapy,
        "Calories": element._source.Calories,
        "Message": element._source.Message,
        "LogType": element._source.LogType,
        "LogDate": element._source.LogDate,
        "Source": element._source.Source,
        "CorrelationId": element._source.CorrelationId
      });
    });
    return results;
  });
}

//ElasticRepository.prototype.search = search;
ElasticRepository.prototype.getData = getData;
ElasticRepository.prototype.ping = ping;
module.exports = ElasticRepository;