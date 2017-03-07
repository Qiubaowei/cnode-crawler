/**
 * Created by xaj on 2017/01/11.
 */
var dbhd = require('doohanpub').dbhd;
var Schema = dbhd.Schema;

var articleSchema = new Schema({
    title  : String,
    href   : String,
    comment: String
});

articleSchema.methods.setArticleInfo = function(title, article) {
    this.title    = title;
    this.href     = article.href;
    this.comment  = article.comment;
};

function ArticleModel() {
    this.article = null;
}

ArticleModel.prototype.createArticleModel = function(mongoHandle) {
    this.article   = mongoHandle.model('articleInfo', articleSchema);
    return this.article;
};

//添加 Article 信息
ArticleModel.prototype.addArticle = function(title, articleInfo){
    var articleInfoEntity = new articleModel.article();
    articleInfoEntity.setArticleInfo(title, articleInfo);
    console.log('add article information :' + articleInfoEntity);
    articleInfoEntity.save(function(err){
        if (!err){
            console.log('Add new article information success :' + JSON.stringify(articleInfo));
        }else {
            console.log('Add new article information failed with error :'+ err);
        }
    });
};

ArticleModel.prototype.updateArticleInfo = function(articleInfo)
{
    var updateInfo = {
        title   : articleInfo.title,
        href    : articleInfo.href,
        comment : articleInfo.comment
    };
    var query = {title: articleInfo.title};
    var option = {upsert: true};

    this.article.update(query, updateInfo, option,
        function(err)
        {
            if(err)
            {
                console.error("update article information [title:%s] with err %s",
                    articleInfo.title, err);
            }
            else
            {
                console.log('update article information success '+ JSON.stringify(updateInfo));
            }

        }
    );
};

ArticleModel.prototype.getArticle = function(title, callback){
    this.article.find({title:title}, function(err, results){
        if (!err){
            if (results[0] != undefined){
                console.log('find Article information success: ' + results[0]);
                callback(results);
            }else{
                console.log("can't find Article information. title: "+ title);
                callback('');
            }
        }else {
            console.error('find Article information from db failed with err:' + err);
            callback(err)
        }
    });
};

ArticleModel.prototype.deleteArticle = function(title, callback){
    this.car.remove({title:title}, function(err){
        if (!err){
            console.log('delete article information success. title: '+ title);
            callback();
        }else{
            console.error('delete article information failed. title: '+ title);
        }
    });
};


var articleModel = module.exports = new ArticleModel;