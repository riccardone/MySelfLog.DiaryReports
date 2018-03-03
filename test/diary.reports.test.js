let chai = require('chai');
let chaiHttp = require('chai-http');
let service = require('../src/service')({
  diaryRepository: { getData: getFakeData }
})

let should = chai.should();

chai.use(chaiHttp);

describe('Get Report for Diary', () => {
  it('it should GET all the values', (done) => {
    chai.request(service)
      .get('/diary/ciccio/values/mmol')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

describe('Get Report of Values for Diary from Date to Date', () => {
  it('it should GET all the values within the specified period', (done) => {
    chai.request(service)
      .get('/diary/ciccio/values/mmol/from/2018-01-01/to/2018-01-02')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('it should NOT GET all the values within the specified period', (done) => {
    chai.request(service)
      .get('/diary/ciccio/values/mmol/from/2018-01-02/to/2018-01-01')
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
});

describe('Get Report of Calories for Diary from Date to Date', () => {
  it('it should GET all the calories within the specified period', (done) => {
    chai.request(service)
      .get('/diary/ciccio/calories/from/2018-01-01/to/2018-01-02')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
  it('it should NOT GET all the calories within the specified period', (done) => {
    chai.request(service)
      .get('/diary/ciccio/calories/from/2018-01-02/to/2018-01-01')
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
});

function getFakeData(diaryName, logType, from, to) {
  return new Promise((resolve, reject) => {
    return resolve([{
      "Id": "test",
      "Value": "test",
      "Mmolvalue": "test",
      "SlowTerapy": "test",
      "FastTerapy": "test",
      "Calories": "test",
      "Message": "test",
      "LogType": "test",
      "LogDate": "1970-05-02",
      "Source": "test",
      "CorrelationId": "test"
    }]);
  })
}