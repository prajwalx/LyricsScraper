const express = require('express');
const router = express.Router();

const rp = require('request-promise');/* Same as request , with promise support */
const cheerio = require('cheerio');

router.get('/',function(req, res){
  res.render('index');
});

router.get('/getmusic/:query',function(req,res){
  console.log(req.params.query);
  /*Format search query */
  let query=(req.params.query).toString().trim().replace(/ /g,"+");
  
  /*Generate url azlyrics search */
  let url1=`https://search.azlyrics.com/search.php?q=${query}`

  console.log(url1)
  
  /* Visit url1 */
  rp(url1)
    .then((html)=>{
      /*Traverse html DOM */
      let $ = cheerio.load(html);
      let panels = $('.panel');/* There are multiple panels like Album , Song,.. */
      let url2 = '';
      /* Find Song's panel */
      panels.each((i,panel)=>{
        /*Get heading text for this panel */
        let ph = $(panel).find('.panel-heading b').text();
        if(ph=='Song results:'){
          /*Get all anchor tags in this panel */
          let links = $(panel).find('.text-left>a');//about 20 links
          url2 = $($(links)[0]).attr('href');//get the first one 
          return;//break loop
        }
      });
      /* Send the lyric url to next promise */
      return url2;
      
    })
    .then((url)=>{
      console.log(url)
      /*Visit the Lyrics Page Url */
      rp(url)
      .then((html)=>{
        /*Traverse DOM to scrap lyrics from this page */
        let $ = cheerio.load(html);
        let lyrics = $('.ringtone').nextAll().text();
        /*Send Results */
        res.send(lyrics);
      })
      .catch((err)=>{
        // console.log(err);
        res.send('Lyrics Not Found 1;(');
      });
    })
    .catch((err)=>{
      // console.log(err);
      res.send('Lyrics Not Found 2;(');
    })


});

module.exports = router;
