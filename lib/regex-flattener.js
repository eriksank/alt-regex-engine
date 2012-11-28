/**
	Regex Parser
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function flattens a parsed expression by splitting it over its operators

*/

function flatten(parsedTokens)
{
	var engine=this;

	function copyDeep(collection)
	{
		return JSON.parse(JSON.stringify(collection));
	}


	function fixStateZero(tokens)
	{
		if(tokens.length==0)
			engine.error('internal error; trying to fix state zero in empty token collection','',0);

		var firstToken=tokens[0];
		//first state must always be state 0
		if(firstToken.type=='state') 
		{
                        if(tokens.length==1)
                        {
                                if(firstToken.state!=0)
                                {
                                        tokens.unshift(engine.newCharToken(''));
                                        tokens.unshift(engine.newStateToken(0));
                                }                
                        }
                        else
                        {
                                if(firstToken.state!=0)
                                {
                                        tokens.shift();
                                        tokens.unshift(engine.newStateToken(0));
                                }
                        }
	 	//if it is the only state, it is final
		}
                else if(firstToken.type=='char')
                {
                        tokens.unshift(newStateToken(0));
                        console.log('WARNING: ADDED ZERO STATE:'+engine.tokensToString(tokens));
                }
                return tokens;
        }

	function concat()
	{
		var result=[];
		for(var i=0; i<arguments.length; i++)
			result=result.concat(arguments[i]);
		return result;
	}

        function fixORSegment(segment,tokens)
        {
                if(segment[0].type=='state')
                {
                        if(segment[0].state!=0)
                                segment[0].state=0;
                }
                else if(segment[0].type=='char')
                        segment.shift(newStateToken(0));

                if(segment[segment.length-1].type=='state')
                {
                        if(segment[segment.length-1].state!=tokens[tokens.length-1])
                                segment[segment.length-1]=tokens[tokens.length-1];
                }
                else 
                {
                        segment.push(tokens[tokens.length-1]);
                }
                    return segment;
        }

        function splitHeadTail(array,index)
        {
            var head=array.slice(0,index);
            var tail=array.slice(index).slice(1);
            return { 'head':head,'tail':tail };
        }

	function handleOR(tokens)
	{
		for(var i=0; i<tokens.length; i++)
		{
			var token=tokens[i];

			if(token.type=='|')
			{
                                var r=splitHeadTail(tokens,i);
		                enQueue(fixORSegment(r.head,tokens));
		                enQueue(fixORSegment(r.tail,tokens));
		                return true;
			}
		}
		return false;
	}

	function subdivideTokensByKleeneOp(tokens,i)
	{
		var token=tokens[i];
		var result={};

		//there is no token preceding the Kleene operator
		if(i==0) engine.error('a pattern cannot start with ',token.value,i);

		var precedingToken=tokens[i-1];

		if(precedingToken.type!='char' && precedingToken.type!='exp')
			engine.error('the operator must be preceded by a char or an expression',
				precedingToken.type,i);

		if(precedingToken.type=='exp')
		{
			//an expression is never preceded by a state token
			var startOfRepeated=i-1;
		}
		else
		{
			//a char must be preceded by a state token
			if(i-2<0) engine.error('internal error, char not preceded by state token',
					precedingToken.value,i);
			var beforePrecedingToken=tokens[i-2];
			if(beforePrecedingToken.type!='state')
				engine.error('internal error, char not preceded by state token',
					precedingToken.value,i);
			var startOfRepeated=i-2;
		}

		result.prefix=tokens.slice(0,startOfRepeated);
		result.repeated=tokens.slice(startOfRepeated,i);
		result.suffix=tokens.slice(i+1);			

		return result;
	}

	function handleKleeneStar(r)
	{
		enQueue(concat(r.prefix,r.suffix));
		enQueue(concat(r.prefix,r.repeated,r.suffix));
		enQueue(concat(r.prefix,r.repeated,r.repeated,r.suffix));
	}

	function handleKleenePlus(r)
	{	
		enQueue(concat(r.prefix,r.repeated,r.suffix));
		enQueue(concat(r.prefix,r.repeated,r.repeated,r.suffix));
	}

	function handleKleeneQuestion(r)
	{
		enQueue(concat(r.prefix,r.suffix));
		enQueue(concat(r.prefix,r.repeated,r.suffix));
	}

	function handleKleeneOps(tokens)
	{
		for(var i=0; i<tokens.length; i++)
		{
			var token=tokens[i];
			if(engine.isKeyword(token.type))
			{
				var r=subdivideTokensByKleeneOp(tokens,i);
				switch(token.type)
				{
					case '*': handleKleeneStar(r);break;
					case '+': handleKleenePlus(r);break;
					case '?': handleKleeneQuestion(r);break;
				}
				return true;
			}
		}
		return false;	
	}

        function indexOROp(tokens)
        {
            for(var i in tokens)
                if(tokens[i].type=='|') return i;
            return -1;
        }

	function bringBackExpressions(tokens)
	{
                var substitutions=0;
                for(var i=0; i<tokens.length; i++)
                {        
                        var token=tokens[i];
                        if(token.type=='exp')
                        {
                                var prefix=tokens.slice(0,i);
                                var expression=engine.expressions[token.expkey];
                                var suffix=tokens.slice(i+1);
                                var indexOR=indexOROp(expression);
                                if(indexOR>=0)
                                {
                                        var r=splitHeadTail(expression,indexOR);
                                        var tokens1=concat(prefix,r.head,suffix);
                                        var tokens2=concat(prefix,r.tail,suffix);                       
                                        enQueue(fixORSegment(tokens1,tokens));
                                        enQueue(fixORSegment(tokens2,tokens));
                                        return true;
                                }
                                else
                                {
                                        tokens=concat(prefix,expression,suffix);
                                        i=prefix.length+expression.length;
                                        substitutions++;
                                }
                        }
                }

                if(substitutions>0) 
                {
                        enQueue(tokens);
                        return true;
                }

                return false;
        }

        function enQueue(tokens)
        {
	        tokens=fixStateZero(copyDeep(tokens));
	        queue[engine.uniqueKey(tokens)]=tokens;
                if(this.debug) console.log('ENQUEUED:'+engine.tokensToString(tokens));
        }

        function addToFlattenedResults(tokens)
        {
	        flattened[engine.uniqueKey(tokens)]=tokens;
        }

	/* main flattening logic */

	var queue={};
	var flattened={};
        enQueue(parsedTokens);
	while(Object.keys(queue).length>0)
	{
		var queueKey=Object.keys(queue).shift();
		//get first pattern in queue
		var tokens=queue[queueKey];
		delete queue[queueKey];

		if(handleOR(tokens)) continue;
		if(handleKleeneOps(tokens)) continue;
		if(bringBackExpressions(tokens)) continue;

		addToFlattenedResults(tokens);
	}

	flattenedArray=[];
	for(var key in flattened)
		flattenedArray.push(flattened[key]);
	return flattenedArray;
}

module.exports=flatten;

