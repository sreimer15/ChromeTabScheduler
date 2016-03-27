var expect = chai.expect;
var should = chai.should();

describe('handleTiming tests', function(){
  var previousQueue = {};
  var timing = Date.now() + 3000;
  var newSetOfTabs = [{'url':'http://www.reddit.com','title':'topKek'},{
    'url':'http://www.google.com','title':'topLel'
  }]
  console.log(handleOpening)
  it("should always return an object", function(){
    expect(handleTiming(previousQueue,newSetOfTabs,timing)).to.be.an('object')
  });
  it("should always return an object with proper categories", function(){
    expect(handleTiming(previousQueue,newSetOfTabs,timing)).to.include.keys(timing.toString())
    expect(handleTiming(previousQueue,newSetOfTabs,timing)[timing.toString()] ).to.contain(newSetOfTabs);
  })
})