/*!
 * qwebs-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * Inspire by https://github.com/nswbmw/qs-mongodb
 * MIT Licensed
 */
const { Error, UndefinedError } = require("oups");
const qs = require('qs');

const logicalOperators = {
  '&&': '$and',
  '||': '$or',
  //'^' : '$nor'
};

/**
 * price>5 => { price: { $gt: 5 }}
 * skip=5 => { skip: 5 }
 * sort[name]=1 => { sort: { name: 1 }}
 */ 
class MongoQueryString {

    constructor($json) {
      this.json = $json;
    }

    parse(querystring) {
        if (!querystring) return querystring;
        querystring = this.formatComparisonOperators(querystring);

        let pathReg;
        while (pathReg = querystring.match(/\(([^\(]+?)\)/)) {
            querystring = querystring.replace(pathReg[0], this.formatLogicalOperators(pathReg[1]));
        }

        querystring = this.formatLogicalOperators(querystring);
        querystring = this.formatCommaOperators(querystring);

        const query = qs.parse(querystring);
        const { skip, limit, sort, project, ...filter } = this.json.typed(query);
        return { filter, skip, limit, sort, project };
    }

    formatComparisonOperators(str) {
      str = str.replace(/(=?!)(?!=)/g, '[$not]='); //special
      str = str.replace(/=?>=/g, '[$gte]=');
      str = str.replace(/=?<=/g, '[$lte]=');
      str = str.replace(/=?(!=|<>)/g, '[$ne]=');
      str = str.replace(/=?>/g, '[$gt]=');
      str = str.replace(/=?</g, '[$lt]=');
    
      //regexp with options
      str = str.replace(/([^&|]+)=\/([^&|]+)\/(\w*)/g, `$1[$regex]=$2&$1[$options]=$3`);
      
      return str;
    }
      
    formatLogicalOperators(str) {
      for (let operator in logicalOperators) {
        if (~str.indexOf(operator)) {
          str = str.split(operator).map((item, index) => {
            return item.split('&').map(item => {
              return logicalOperators[operator] + '[' + index + ']' + item.replace(/^([^\[=]+)/, '[$1]');
            }).join('&');
          }).join('&');
          break;
        }
      };
      return str;
    }
      
    formatCommaOperators(str) {
      if (!str.match(/,/)) return str;
      return str.split('&').map(item => {
        return item.replace(/(.+)=((.+)(,(.+))+)/g, (querystring, p1, p2) => {
          return p2.split(',').map((item) => {
            return p1 + '[$in]=' + item;
          }).join('&');
        });
      }).join('&');
    }
}

exports = module.exports = MongoQueryString;