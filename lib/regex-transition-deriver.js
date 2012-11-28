/**
	Regex Transition Deriver
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function computes all transitions in the flattened expressions
*/

function deriveTransitions(flattened)
{
	var engine=this;
	var transitions={};

	function addTransition(transition)
	{
		transitions[engine.uniqueKey(transition)]=transition;
	}

	for(var key in Object.keys(flattened))
	{
		var tokens=flattened[key];
		var stokens=JSON.stringify(tokens);

		for(var i=0; i<tokens.length-2; i+=2)
		{
			//STATE FROM
			var stateFrom=tokens[i];
			if(stateFrom.type!='state')
				engine.error('internal error; token is not a state',stokens,i);

			//CHAR
			if(i+1>=tokens.length)
				engine.error('internal error; state-from not followed by a token',stokens,i+1);
			var char=tokens[i+1];
			if(char.type!='char')
				engine.error('internal error; token is not a char',stokens,i+1);

			//STATE TO
			if(i+2>=tokens.length)
				engine.error('internal error; char not followed by a token',stokens,i+1);
			var stateTo=tokens[i+2];
			if(stateTo.type!='state')
				engine.error('internal error; token is not a state',stokens,i+2);
			
			addTransition({'from':stateFrom.state,'char':char.value,'to':stateTo.state,'final':stateTo.final});
		}
	}

	transitionArray=[];
	for(var key in transitions)
		transitionArray.push(transitions[key]);

	return transitionArray;
}

module.exports=deriveTransitions;

