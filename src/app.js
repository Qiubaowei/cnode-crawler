var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');
var dbhd  = require('doohanpub').dbhd;
var config = require('doohanpub').config;
var url = require('url');
var async = require('async');

var mongoConnParas = config.get('mongoConnParas');

var articleModel = require('./models/articleModel');

dbhd.connectDatabase(mongoConnParas);


articleModel.createArticleModel(dbhd.mongo);

var app = express();

var cnodeUrl = 'https://cnodejs.org/';

app.get('/', function (req, res, next) {
    superagent.get(cnodeUrl)
        .end(function (err, homePage) {
            if (err) {
                return next(err);
            }
            var topicUrls = [];
            var $ = cheerio.load(homePage.text);
            // 获取首页所有的链接
            $('#topic_list .topic_title').each(function (idx, element) {
                var $element = $(element);
                // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
                // 我们用 url.resolve 来自动推断出完整 url，变成
                // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
                // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
                var href = url.resolve(cnodeUrl, $element.attr('href'));
                topicUrls.push(href);
            });

            console.log(topicUrls);
            async.mapLimit(topicUrls, 5, function (item, cb) {
                superagent.get(item)
                    .end(function (err, result) {
                        if (err) {
                            console.error(err);
                            cb(err)
                        }
                        else
                        {
                            var $ = cheerio.load(result.text);
                            var resp = {
                                title: $('.topic_full_title').text().trim(),
                                href: item,
                                comment1: $('.reply_content').eq(0).text().trim(),
                            }
                            cb(null, resp)
                        }
                    })
            }, function (err, results) {
                console.log(results)
                res.send(results);
            })


        });
});


app.listen(1437, function () {
    console.log('app is listening at port 1437');
});