const http = require('http');
const fs = require('fs');
const yaml = require('js-yaml');

let data = yaml.load(fs.readFileSync('config.yml'));

const server = http.createServer(function (req, res) {
  const url = req.url;
  let elem = getMatchingRedirect(data, req.url);

  if(elem !== undefined){
    if(elem.url.mode == "text"){
      res.writeHead(200);
      res.write(elem.url.res);
      res.end();
    }
    else{
      res.writeHead(302, {
        location: elem.url.res,
      });
      res.end();
    }
  } else {
    // do a 404 redirect
    elem = getMatchingRedirect(data, '404NotFound');
    res.writeHead(404);
    res.write(elem.url.res);
    res.end();
  }
});

server.listen(8080, function () {
  console.log("server started at port 8080");
});


function getMatchingRedirect(data, url){
  let match;

  match = data.urls.find(elem => {
    let mode = elem.url.mode;

    //First Check all simple redirects
    if(mode === undefined || mode === 'text') {
      return elem.url.req == url;
    }
  })
  if(match !== undefined){
    return match;
  }

  let replacedUrl;
  match = data.urls.find(elem => {
    let mode = elem.url.mode;
    
    //Now Check all pattern redirects
    if(mode === "pattern") {
      let regex = url.match(elem.url.pattern);
      if(regex === null){
        //Is not Matching
        return false;
      }


      replacedUrl = elem.url.res;
      for(let i=1;i<=regex.length;i++){
        replacedUrl = replacedUrl.replace("$" + i, regex[i]);
      }
      console.log("replacedUrl: " + replacedUrl);
      return true;
    }
  })
  if(match !== undefined){
    // let newMatch = Object.assign([], match);
    // newMatch.url.res = replacedUrl;
    return {
      url: {
        mode: match.url.mode,
        pattern: match.url.pattern,
        res: replacedUrl
      }
    };
  }
}