const http = require('http');
const fs = require('fs');
const yaml = require('js-yaml');

let data = yaml.load(fs.readFileSync('config.yml'));

const server = http.createServer(function (req, res) {
  // const url = req.url;
  let elem = getMatchingRedirect(data, req.url);

  if(elem !== undefined){
    if(elem.mode == "text"){
      res.writeHead(200);
      res.write(elem.res);
      res.end();
    }
    else{
      res.writeHead(302, {
        location: elem.res,
      });
      res.end();
    }
  } else {
    // do a 404 redirect
    elem = getMatchingRedirect(data, '404NotFound');
    res.writeHead(404);
    res.write(elem.res);
    res.end();
  }
});

server.listen(8080, function () {
  console.log(new Date().toLocaleString() + " >> server started at port 8080");
});


function getMatchingRedirect(data, url){
  let match, outputMatch;

  console.log(new Date().toLocaleString() + " >> request: " + url);

  match = data.urls.find(elem => {
    let mode = elem.mode;

    //First Check all simple redirects
    if(mode === undefined || mode === 'text') {
      return elem.req == url;
    }
  })

  if(match){
    outputMatch = Object.assign({}, match);
  }

  let replacedUrl;

  if(!outputMatch){
    match = data.urls.find(elem => {
      //Now Check all pattern redirects
      if(elem.mode === "pattern") {
        let regex = url.match(elem.pattern);
        if(regex){
          replacedUrl = elem.res;
          for(let i=1;i<=regex.length;i++){
            replacedUrl = replacedUrl.replace(new RegExp("\\$" + i, 'g'), regex[i]);
          }
          return true;
        }
      }
    })
  }

  if(replacedUrl){
    outputMatch = Object.assign({}, match);
    outputMatch.res = replacedUrl;
  }

  if(outputMatch && outputMatch.eval){
    outputMatch.res = eval(outputMatch.res);
  }

  console.log(new Date().toLocaleString() + " >>> match: " + JSON.stringify(outputMatch));
  return outputMatch;
}