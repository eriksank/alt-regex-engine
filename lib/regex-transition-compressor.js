/**
	Regex Transition Compressor
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function compresses the transitions making sure that every (from/char) is unique

*/

function compressTransitions(transitions)
{
        var engine=this;

        var transitionsTemp={};

        for(var i in transitions)
        {
            var transition=transitions[i];
            var key=transition.from+'.'+transition.char;
            if(!transitionsTemp[key])
                transitionsTemp[key]={'from':transition.from,'char':transition.char,
                        'to':[{'to':transition.to,'final':transition.final}]};
            else transitionsTemp[key].to.push({'to':transition.to,'final':transition.final});
        }

        return transitionsTemp;
}

module.exports=compressTransitions;

