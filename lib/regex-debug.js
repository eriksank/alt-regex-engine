/**
	Regex Debug
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function provides debug output functions
*/

module.exports=
{
        tokensToString:function (tokens,expressionNumbers)
        {
                var buffer='';
                for(var i=0; i<tokens.length; i++)
                {
                        var token=tokens[i];
                        buffer+=' ';
                        if(token.type=='char')
                        {
                                if(token.value=='')
                                        buffer+=token.value+'  ';
                                else
                                        buffer+=token.value+' ';
                        }
                        else if(token.type=='state')
                        {
                                buffer+='['+token.state+']';
                                if(token.final) buffer+='F '; else buffer+=' ';
                        }
                        else if(token.type=='exp')
                        {
                                var expressionNumber=expressionNumbers.indexOf(token.expkey)+1;
                                buffer+=token.type+expressionNumber+' ';
                        }
                        else
                        {
                                buffer+=token.type+' ';
                        }
                }
                return buffer;
        },
        printExpressions:function (expressions,expressionNumbers)
        {
                var i=1;
                for(var key in expressions)
                {
                        var expression=expressions[key];
                        console.log(i+':'+this.tokensToString(expression,expressionNumbers));
                        i++;
                }
        },
        printTransitions:function (transitions,title)
        {
            console.log('----------------');
            console.log(title);
            console.log('----------------');
            for(var i in transitions)
                console.log(JSON.stringify(transitions[i]));
        },
        printFlattened:function(flattened)
        {
            console.log('---------');
            console.log('FLATTENED');
            console.log('---------');
            for(var key in flattened)
            {
                console.log(this.tokensToString(flattened[key]));
            }
        }
}

