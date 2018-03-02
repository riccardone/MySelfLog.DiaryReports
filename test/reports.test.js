let chai = require('chai');
let should = chai.should();
let server = require('../app');

describe('It should work', () => {
  it('it should GET all the values', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});