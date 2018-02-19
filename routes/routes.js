var express = require('express');
var router = express.Router();

var request = require('request');
var cheerio = require('cheerio');

router.get('/',function(req, res){
  res.render('index');
});

router.get('/getmusic/:query',function(req,res){
//var url1='www.google.co.in/search?='
console.log(req.params.query);
var query=""+req.params.query;
query=query.replace(/ /g,"+");
var url1="https://www.google.co.in/search?q="+query+"+metrolyrics";
var metroUrl;
request(url1,function(error,response,html){
  // console.log(error);
    if(!error){
      console.log(url1);//success
      var $ = cheerio.load(html);
      //Now Scrap the first google link
      //$('.r','a').children[0].href
      var links = $('a','.r');//Get All Links
      $(links).each(function(i, link){
        var text=$(link).text();
        if(text.search("MetroLyrics")!==-1){
          metroUrl=$(link).attr('href').substring(7);
          console.log(metroUrl);
          return false;//break the loop each
        }
        //console.log($(link).text() + ':\n  ' + $(link).attr('href'));
      });//end links scraping

      if(!metroUrl||metroUrl.length<3){
      res.send('Lyrics Not Found ;(');
      }

      else{
        request(metroUrl,function(error,response,html){
          if(!error){
            var $ = cheerio.load(html);
            var data = $('.verse');
            res.send(data.text());
            //console.log(data.text());
          }//end-if !error MetroLyrics

          /*
          If Error Occurs IN MetroLyrics Scraping
          */
          else{
            res.send('Lyrics Not Found ;(');
          }
        });
      }//end else
    }//end if(error)

    /*
    If Error Occurs IN Google Search
    */
    else{
      res.send('Lyrics Not Found ;(');
    }
});//end Google Search


});

module.exports = router;
