/**
	Regex Parser
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function extracts the expressions from the list of tokens

*/

function parse(tokens)
{
	var engine=this;

	function handleBracketRight(tokens,positionBracketRight)
	{
		function extractExpression(tokens,positionBracketLeft,positionBracketRight)
		{
			var tokens2=tokens.slice(0,positionBracketLeft);
			tokens2.push(engine.newExpressionToken(tokens.slice(positionBracketLeft+1,positionBracketRight)));
			tokens2=tokens2.concat(tokens.slice(positionBracketRight+1));
			return tokens2;
		}

		var positionBracketLeft=positionBracketRight-1;

		while(positionBracketLeft>=0) 
		{
		    var token=tokens[positionBracketLeft];
		    if(token.type=='(')
			return {
					'newTokens':extractExpression(tokens,positionBracketLeft,positionBracketRight),
					'newIndex':positionBracketLeft+1
				}
		    positionBracketLeft--;
		}

		engine.error("missing '(' expected ",')',positionBracketRight);
	}


	for(var i=0; i<tokens.length; i++)
	{
		var token=tokens[i];
		if(token.type==')') 
		{
			var result=handleBracketRight(tokens,i);
			tokens=result.newTokens;
			i=result.newIndex;
		}					
	}

	return tokens;
}

module.exports=parse;

