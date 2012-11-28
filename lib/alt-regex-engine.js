/**
	Alternative Regex Engine
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function compiles the regular expression to a set of transitions

*/
function engine(enableDebug)
{
        this.expressions={};
        this.expressionNumbers=[];

        this.reset=function()
        {
                this.expressions={};
                this.expressionNumbers=[];
        }

	this.uniqueKey=function(item)
	{
            item=JSON.stringify(item);
            var hash = 0, i, char;
            if (item.length == 0) return hash;
            for (i = 0; i < item.length; i++) {
                char = item.charCodeAt(i);
                hash = ((hash<<5)-hash)+char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
	}

	this.keywords=['(',')','*','+','?','|'];

	this.isKeyword=function(c)
	{
		if(this.keywords.indexOf(c)==-1) return false;
		return true;
	}

        this.newKeywordToken=function(c)
        {
            return newToken(c,'','','','',false);
        }

        this.newCharToken=function(c)
        {
            return newToken('char',c,'','',false);
        }

        this.newFinalToken=function(state)
        {
            return newToken('state','',state,'',true);
        }

        this.newStateToken=function(state)
        {
            return newToken('state','',state,'',false);
        }

	this.newExpressionToken=function(tokens)
	{
		var key=this.uniqueKey(tokens);
		this.expressions[key]=tokens;
                this.expressionNumbers.push(key);
		return newToken('exp','','',key);
	}

        function newToken(type, value, state, expkey,final)
        {
            return {'type':type,'value':value,'state':state,'expkey':expkey,'final':final};
        }

	this.error=function(msg,char,i)
	{
		throw new Error(msg+' '+char+' in pos. '+(i+1));
	}

        this.lex=require('./regex-lexer');
        this.parse=require('./regex-parser');
        this.flatten=require('./regex-flattener');
        this.deriveTransitions=require('./regex-transition-deriver');
        this.compressTransitions=require('./regex-transition-compressor');
        this.disambiguateTransitions=require('./regex-transition-disambiguator');
        this.purgeTransitions=require('./regex-transition-purger');

        var debug=require('./regex-debug');
        debug.enabled=false || enableDebug;

        this.compile=function(pattern)
        {
                this.reset();

                //PATTERN
                if(debug.enabled) 
                {
                        console.log('*******');
                        console.log('PATTERN');
                        console.log('*******');
                        console.log(pattern);
                }

                //LEX
                var tokens=this.lex(pattern);
                if(debug.enabled) 
                {
                        console.log('-----');
                        console.log('LEXED');
                        console.log('-----');
                        console.log(debug.tokensToString(tokens));
                }

                //PARSE
                tokens=this.parse(tokens);
                if(debug.enabled)
                {
                        console.log('------');
                        console.log('PARSED');
                        console.log('------');
                        console.log(debug.tokensToString(tokens,this.expressionNumbers));
                        console.log('-----------');
                        console.log('EXPRESSIONS');
                        console.log('-----------');
                        debug.printExpressions(this.expressions,this.expressionNumbers);
                }
                //PARSE
                var flattened=this.flatten(tokens);
                if(debug.enabled) debug.printFlattened(flattened);

                //DERIVE
                var transitions=this.deriveTransitions(flattened);
                if(debug.enabled) debug.printTransitions(transitions,'TRANSITIONS');

                //COMPRESS
                transitions=this.compressTransitions(transitions);
                if(debug.enabled) debug.printTransitions(transitions,'COMPRESSED');

                //DISAMBIGUATE
                transitions=this.disambiguateTransitions(transitions);
                if(debug.enabled) debug.printTransitions(transitions,'DISAMBIGUATED');

                //PURGE
                transitions=this.purgeTransitions(transitions);
                if(debug.enabled) debug.printTransitions(transitions,'PURGED');

                return transitions;
        }
}

module.exports=engine;


