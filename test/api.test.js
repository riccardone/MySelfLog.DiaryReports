let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('api/v1/ciccio/values/mmol', () => {        
  describe('/GET data', () => {
      it('it should GET all the values', (done) => {
        chai.request(server)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);               
              done();
            });
      });
  });
});