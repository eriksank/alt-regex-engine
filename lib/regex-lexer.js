/**
	Regex Lexer
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function turns groups of characters into tokens

*/
function lex(pattern)
{

        var engine=this;

	var tokens=[];
	var state=0;

	for(var i=0; i<pattern.length; i++)
	{
		var c=pattern[i];
                if(engine.isKeyword(c))
                {
                        tokens.push(engine.newKeywordToken(c));
                }
		else 
		{
			if(c=='\\')
			{
				i++;
				if(i<pattern.length) c=pattern[i]; 
				else engine.error("pattern must not end with:",c,i);
			}
			tokens.push(engine.newStateToken(state));
			tokens.push(engine.newCharToken(c));
                        state++;
		}
	}
	tokens.push(engine.newFinalToken(state));
	return tokens;
}

module.exports=lex;

